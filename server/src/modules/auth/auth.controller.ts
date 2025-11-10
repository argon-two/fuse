import type { Request, Response } from "express";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schema";
import { asyncHandler } from "../../utils/async-handler";
import { createBadRequest } from "../../utils/errors";
import { getCurrentUser, login, logout, refresh, register } from "./auth.service";

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid registration data", parsed.error.flatten());
  }

  const meta: { userAgent?: string; ipAddress?: string } = {};
  if (typeof req.headers["user-agent"] === "string") {
    meta.userAgent = req.headers["user-agent"];
  }
  if (req.ip) {
    meta.ipAddress = req.ip;
  }

  const result = await register(parsed.data, meta);

  res.status(201).json(result);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid login data", parsed.error.flatten());
  }

  const meta: { userAgent?: string; ipAddress?: string } = {};
  if (typeof req.headers["user-agent"] === "string") {
    meta.userAgent = req.headers["user-agent"];
  }
  if (req.ip) {
    meta.ipAddress = req.ip;
  }

  const result = await login(parsed.data, meta);

  res.json(result);
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid refresh request", parsed.error.flatten());
  }

  const result = await refresh(parsed.data.refreshToken);
  res.json(result);
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    throw createBadRequest("Invalid logout request", parsed.error.flatten());
  }

  await logout(parsed.data.refreshToken);
  res.status(204).send();
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const user = await getCurrentUser(req.user.id);
  res.json({ user });
});
