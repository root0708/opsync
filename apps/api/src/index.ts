import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { authMiddleware } from "./middleware/auth.js";
import { healthRouter } from "./routes/health.js";
import { meRouter } from "./routes/me.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/me", authMiddleware, meRouter);

app.listen(port, () => {
  console.log(`OPSYNC API listening on http://localhost:${port}`);
});

export { createClient };
