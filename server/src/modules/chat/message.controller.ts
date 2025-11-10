import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { createBadRequest } from "../../utils/errors";
import { listMessagesSchema, sendMessageSchema } from "./message.schema";
import { listMessages, sendMessage } from "./message.service";

export const sendMessageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = sendMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid message data", parsed.error.flatten());
  }

  const message = await sendMessage(req.user.id, parsed.data);
  res.status(201).json({ message });
});

export const listMessagesHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsedQuery = listMessagesSchema.safeParse(req.query);
  if (!parsedQuery.success) {
    throw createBadRequest("Invalid query params", parsedQuery.error.flatten());
  }

  const { channelId } = req.params as { channelId: string };
  const result = await listMessages(req.user.id, channelId, parsedQuery.data);
  res.json(result);
});
