import { Router } from "express";
import { Document, Filter, ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "../utils/mongoClient";

interface EventDocument extends Document {
  user_id: string;
  content?: {
    path?: string;
    hostname?: string;
  };
  occurred_at?: Date | string;
  timestamp?: Date | string;
  received_at?: Date | string;
  created_at?: Date | string;
  _id?: unknown;
}

const router = Router();

const stepSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(1)
      .optional(),
    hostname: z
      .string()
      .trim()
      .min(1)
      .optional(),
    path: z
      .string()
      .trim()
      .min(1)
      .optional()
  })
  .refine(
    (value) => Boolean(value.hostname || value.path),
    "Each step must include at least a hostname or a path."
  );

const requestSchema = z.object({
  startDate: z.string().min(1, "startDate is required"),
  endDate: z.string().min(1, "endDate is required"),
  steps: z.array(stepSchema).min(1, "Provide at least one funnel step.")
});

type StepInput = z.infer<typeof stepSchema>;

const deriveLabel = (step: StepInput, index: number): string => {
  if (step.label && step.label.trim().length > 0) {
    return step.label.trim();
  }
  if (step.path) {
    return step.path;
  }
  if (step.hostname) {
    return step.hostname;
  }
  return `Step ${index + 1}`;
};

const parseDateOrThrow = (value: string, field: string): Date => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${field}. Expecting ISO date string.`);
  }
  return date;
};

const normalize = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }
  return value.trim().toLowerCase();
};

const getEventTimestamp = (event: EventDocument): Date => {
  const candidate =
    event.occurred_at ?? event.timestamp ?? event.received_at ?? event.created_at;
  if (candidate instanceof Date) {
    return candidate;
  }
  if (typeof candidate === "string") {
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  if (event._id && event._id instanceof ObjectId) {
    return event._id.getTimestamp();
  }
  return new Date(0);
};

router.post("/", async (req, res) => {
  try {
    const parsedBody = requestSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        error: "Invalid request payload.",
        details: parsedBody.error.format()
      });
    }

    const { startDate, endDate, steps } = parsedBody.data;

    const start = parseDateOrThrow(startDate, "startDate");
    start.setHours(0, 0, 0, 0);
    const end = parseDateOrThrow(endDate, "endDate");
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      return res.status(400).json({
        error: "startDate must be before or equal to endDate."
      });
    }

    const eventsCollection = getCollection<EventDocument>("events");

    const query: Filter<EventDocument> = {
      platform: "web",
      type: "page_view"
    };

    const startSeconds = Math.floor(start.getTime() / 1000);
    const endSeconds = Math.floor(end.getTime() / 1000) + 86400;

    query._id = {
      $gte: ObjectId.createFromTime(startSeconds),
      $lt: ObjectId.createFromTime(endSeconds)
    };

    const events = await eventsCollection
      .find(query, {
        hint: { _id: 1 },
        projection: {
          user_id: 1,
          content: 1,
          occurred_at: 1,
          timestamp: 1,
          received_at: 1,
          created_at: 1
        }
      })
      .toArray();

    const filteredEvents = events.filter((event) => {
      const eventDate = getEventTimestamp(event);
      return eventDate >= start && eventDate <= end;
    });

    // Organize events by user to evaluate the funnel sequentially.
    const eventsByUser = new Map<string, EventDocument[]>();
    for (const event of filteredEvents) {
      if (!event.user_id) {
        continue;
      }
      const userEvents = eventsByUser.get(event.user_id) ?? [];
      userEvents.push(event);
      eventsByUser.set(event.user_id, userEvents);
    }

    // Ensure each user's events are in chronological order.
    for (const userEvents of eventsByUser.values()) {
      userEvents.sort((a, b) => {
        const dateA = getEventTimestamp(a).getTime();
        const dateB = getEventTimestamp(b).getTime();
        return dateA - dateB;
      });
    }

    const matchesStep = (event: EventDocument, step: StepInput): boolean => {
      const eventHostname = normalize(event.content?.hostname ?? null);
      const eventPath = event.content?.path ?? null;

      const hostnameMatches =
        !step.hostname || normalize(step.hostname) === eventHostname;
      const pathMatches = !step.path || step.path === eventPath;

      return hostnameMatches && pathMatches;
    };

    const progressByUser = new Map<string, number>();
    let eligibleUsers = new Set(eventsByUser.keys());

    const responseSteps = steps.map((step, index) => {
      const nextEligible = new Set<string>();

      for (const userId of eligibleUsers) {
        const userEvents = eventsByUser.get(userId) ?? [];
        const startIndex = progressByUser.get(userId) ?? -1;

        let matchedIndex = -1;
        for (let i = startIndex + 1; i < userEvents.length; i += 1) {
          if (matchesStep(userEvents[i], step)) {
            matchedIndex = i;
            break;
          }
        }

        if (matchedIndex !== -1) {
          progressByUser.set(userId, matchedIndex);
          nextEligible.add(userId);
        }
      }

      const usersAtStep = nextEligible.size;
      const previousUsers = index === 0 ? usersAtStep : eligibleUsers.size;

      const conversion =
        index === 0
          ? usersAtStep > 0
            ? 100
            : 0
          : previousUsers === 0
          ? 0
          : Number(((usersAtStep / previousUsers) * 100).toFixed(2));

      eligibleUsers = nextEligible;

      return {
        label: deriveLabel(step, index),
        users: usersAtStep,
        conversion
      };
    });

    return res.json({ steps: responseSteps });
  } catch (error) {
    console.error("Failed to compute funnel", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
