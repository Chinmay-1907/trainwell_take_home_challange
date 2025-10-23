import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import funnelRouter from "./routes/funnel";
import { connectToDatabase } from "./utils/mongoClient";

dotenv.config();

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.use("/api/funnel", funnelRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });
