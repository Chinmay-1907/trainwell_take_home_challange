export interface FunnelStepRequest {
  hostname?: string;
  path?: string;
  label?: string;
}

export interface FunnelStepResponse {
  label: string;
  users: number;
  conversion: number;
  timeToStep?: {
    count: number;
    medianMs: number;
    p95Ms: number;
  } | null;
}

export interface FunnelRequestBody {
  startDate: string;
  endDate: string;
  steps: FunnelStepRequest[];
}

export const runFunnel = async (
  payload: FunnelRequestBody
): Promise<FunnelStepResponse[]> => {
  const response = await fetch("/api/funnel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as { steps?: FunnelStepResponse[] };
  return data.steps ?? [];
};
