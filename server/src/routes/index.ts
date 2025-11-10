import { Router, type Express } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { serverRouter } from "../modules/server/server.routes";
import { channelRouter } from "../modules/chat/channel.routes";
import { messageRouter } from "../modules/chat/message.routes";
import { uploadRouter } from "../modules/chat/upload.routes";
import { callRouter } from "../modules/call/call.routes";

export function registerRoutes(app: Express) {
  const apiRouter = Router();

  apiRouter.use("/auth", authRouter);
  apiRouter.use("/servers", serverRouter);
  apiRouter.use("/channels", channelRouter);
  apiRouter.use("/messages", messageRouter);
  apiRouter.use("/uploads", uploadRouter);
  apiRouter.use("/calls", callRouter);

  app.use("/api", apiRouter);
}
