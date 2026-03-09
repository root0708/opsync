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
import { listsRouter } from "./routes/lists.js";

const app = express();
const port = Number(process.env.PORT) || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://opsync-web.vercel.app",
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
];
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))
        cb(null, true);
      else cb(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/me", authMiddleware, meRouter);
app.use("/api/v1/lists", authMiddleware, listsRouter);

app.listen(port, () => {
  console.log(`OPSYNC API listening on http://localhost:${port}`);
});

export { createClient };
