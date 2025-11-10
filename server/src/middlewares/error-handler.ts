import { type NextFunction, type Request, type Response } from "express";
import { AppError } from "../utils/errors";
import { logger } from "../lib/logger";

export function registerErrorHandlers(app: import("express").Express) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      if (err.statusCode >= 500) {
        logger.error("AppError", { err, path: req.path });
      }
      return res.status(err.statusCode).json({
        error: err.message,
        details: err.details,
      });
    }

    logger.error("Unexpected error", {
      err,
      path: req.path,
    });

    return res.status(500).json({
      error: "Internal Server Error",
    });
  });
}
