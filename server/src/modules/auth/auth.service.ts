import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyToken, type RefreshTokenPayload } from "../../utils/jwt";
import { config } from "../../config/env";
import { addDays } from "../../utils/date";
import { createConflict, createNotFound, createUnauthorized } from "../../utils/errors";
import type { LoginInput, RegisterInput } from "./auth.schema";

const userSelect = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  bio: true,
  createdAt: true,
};

function sanitizeUser(user: any) {
  return user;
}

async function createSession(userId: string, userAgent?: string, ipAddress?: string) {
  const sessionSecret = randomUUID();
  const tokenHash = await hashPassword(sessionSecret);
  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      userAgent: userAgent ?? null,
      ipAddress: ipAddress ?? null,
      expiresAt: addDays(new Date(), config.refreshTokenTtlDays),
    },
  });

  return {
    session,
    sessionSecret,
  };
}

function buildAuthTokens(user: { id: string; email: string }, session: { id: string }, sessionSecret: string) {
  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
  });
  const refreshToken = signRefreshToken({
    sessionId: session.id,
    userId: user.id,
    sessionSecret,
  });

  return { accessToken, refreshToken };
}

export async function register(data: RegisterInput, meta?: { userAgent?: string; ipAddress?: string }) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existing) {
    throw createConflict("User with provided email or username already exists");
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username.toLowerCase(),
      displayName: data.displayName ?? data.username,
      passwordHash,
    },
    select: userSelect,
  });

  const { session, sessionSecret } = await createSession(user.id, meta?.userAgent, meta?.ipAddress);
  const tokens = buildAuthTokens(user, session, sessionSecret);

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
}

export async function login(data: LoginInput, meta?: { userAgent?: string; ipAddress?: string }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.identifier.toLowerCase() }, { username: data.identifier.toLowerCase() }],
    },
    select: {
      ...userSelect,
      passwordHash: true,
    },
  });

  if (!user) {
    throw createUnauthorized("Invalid credentials");
  }

  const isValid = await comparePassword(data.password, user.passwordHash);
  if (!isValid) {
    throw createUnauthorized("Invalid credentials");
  }

  const { passwordHash: _, ...safeUser } = user;

  const { session, sessionSecret } = await createSession(user.id, meta?.userAgent, meta?.ipAddress);
  const tokens = buildAuthTokens(user, session, sessionSecret);

  return {
    user: sanitizeUser(safeUser),
    ...tokens,
  };
}

export async function refresh(refreshToken: string) {
  let payload: RefreshTokenPayload;
  try {
    payload = verifyToken<RefreshTokenPayload>(refreshToken);
  } catch {
    throw createUnauthorized("Invalid refresh token");
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: {
      user: {
        select: userSelect,
      },
    },
  });

  if (!session || !session.user) {
    throw createUnauthorized("Session not found");
  }

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } });
    throw createUnauthorized("Session expired");
  }

  const isValidSecret = await comparePassword(payload.sessionSecret, session.tokenHash);
  if (!isValidSecret) {
    throw createUnauthorized("Invalid refresh token");
  }

  const newSecret = randomUUID();
  const newHash = await hashPassword(newSecret);

  const updatedSession = await prisma.session.update({
    where: { id: session.id },
    data: {
      tokenHash: newHash,
      expiresAt: addDays(new Date(), config.refreshTokenTtlDays),
    },
  });

  const tokens = buildAuthTokens(session.user, updatedSession, newSecret);

  return {
    user: sanitizeUser(session.user),
    ...tokens,
  };
}

export async function logout(refreshToken: string) {
  let payload: RefreshTokenPayload;
  try {
    payload = verifyToken<RefreshTokenPayload>(refreshToken);
  } catch {
    throw createUnauthorized("Invalid refresh token");
  }

  await prisma.session.deleteMany({
    where: {
      id: payload.sessionId,
      userId: payload.userId,
    },
  });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw createNotFound("User not found");
  }

  return sanitizeUser(user);
}
