import type { Request, Response } from "express";
import {
  createServerSchema,
  joinServerSchema,
  updateServerSchema,
} from "./server.schema";
import { asyncHandler } from "../../utils/async-handler";
import { createBadRequest } from "../../utils/errors";
import { createServer, getServerBySlug, joinServer, listServers, updateServer } from "./server.service";

export const createServerHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = createServerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid server data", parsed.error.flatten());
  }

  const server = await createServer(req.user.id, parsed.data);
  res.status(201).json({ server });
});

export const listServersHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const servers = await listServers(req.user.id);
  res.json({ servers });
});

export const getServerHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const { slug } = req.params as { slug: string };
  const server = await getServerBySlug(req.user.id, slug);
  res.json({ server });
});

export const joinServerHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = joinServerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid join data", parsed.error.flatten());
  }

  const { slug } = req.params as { slug: string };
  const server = await joinServer(req.user.id, slug, parsed.data);
  res.json({ server });
});

export const updateServerHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const parsed = updateServerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid update data", parsed.error.flatten());
  }

  const { slug } = req.params as { slug: string };
  const server = await updateServer(req.user.id, slug, parsed.data);
  res.json({ server });
});
