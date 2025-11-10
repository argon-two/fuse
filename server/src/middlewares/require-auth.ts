import type { NextFunction, Request, Response } from "express";
import { verifyToken, type AccessTokenPayload } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { createUnauthorized } from "../utils/errors";

function extractToken(req: Request) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken as string;
  }
  return null;
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    throw createUnauthorized();
  }

  let payload: AccessTokenPayload;
  try {
    payload = verifyToken<AccessTokenPayload>(token);
  } catch {
    throw createUnauthorized();
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  if (!user) {
    throw createUnauthorized();
  }

  req.user = {
    id: user.id,
    email: user.email,
    username: user.username,
  };

  next();
}
