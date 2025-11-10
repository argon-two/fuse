import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { createBadRequest } from "../../utils/errors";
import { callSessionSchema, startCallSchema } from "./call.schema";
import { endCall, joinCall, leaveCall, startCall } from "./call.service";

export const startCallHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = startCallSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid call start data", parsed.error.flatten());
  }

  const session = await startCall(req.user.id, parsed.data);
  res.status(201).json({ session });
});

export const joinCallHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = callSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid call session data", parsed.error.flatten());
  }

  const participant = await joinCall(req.user.id, parsed.data);
  res.status(200).json({ participant });
});

export const leaveCallHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = callSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid call session data", parsed.error.flatten());
  }

  await leaveCall(req.user.id, parsed.data);
  res.status(204).send();
});

export const endCallHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = callSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid call session data", parsed.error.flatten());
  }

  const session = await endCall(req.user.id, parsed.data);
  res.status(200).json({ session });
});
