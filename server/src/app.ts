import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { config } from "./config/env";
import { logger } from "./lib/logger";
import { registerRoutes } from "./routes";
import { registerErrorHandlers } from "./middlewares/error-handler";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: config.appOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: `${config.maxUploadBytes}b` }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const uploadPath = path.resolve(config.fileStoragePath);
  app.use("/uploads", express.static(uploadPath));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  registerRoutes(app);

  registerErrorHandlers(app);

  app.use((req, res) => {
    logger.warn("Unhandled route", { path: req.path, method: req.method });
    res.status(404).json({ error: "Not Found" });
  });

  return app;
}
