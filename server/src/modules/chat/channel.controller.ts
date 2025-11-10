import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { createBadRequest } from "../../utils/errors";
import { createChannelSchema, updateChannelSchema } from "./channel.schema";
import { createChannel, getChannel, updateChannel } from "./channel.service";

export const createChannelHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = createChannelSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid channel data", parsed.error.flatten());
  }

  const channel = await createChannel(req.user.id, parsed.data);
  res.status(201).json({ channel });
});

export const getChannelHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const { channelId } = req.params as { channelId: string };
  const channel = await getChannel(req.user.id, channelId);
  res.json({ channel });
});

export const updateChannelHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = updateChannelSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid channel data", parsed.error.flatten());
  }

  const { channelId } = req.params as { channelId: string };
  const channel = await updateChannel(req.user.id, channelId, parsed.data);
  res.json({ channel });
});
