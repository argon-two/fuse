import { prisma } from "../../lib/prisma";
import { createForbidden, createNotFound } from "../../utils/errors";
import type { CallSessionInput, StartCallInput } from "./call.schema";
import { getSocketServer } from "../../lib/socket";

const callSessionSelect = {
  id: true,
  channelId: true,
  createdById: true,
  active: true,
  createdAt: true,
  endedAt: true,
  metadata: true,
  channel: {
    select: {
      id: true,
      name: true,
      type: true,
      serverId: true,
    },
  },
  participants: {
    select: {
      id: true,
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      joinedAt: true,
      leftAt: true,
    },
  },
};

async function ensureChannelMembership(userId: string, channelId: string) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: {
      id: true,
      serverId: true,
    },
  });

  if (!channel) {
    throw createNotFound("Channel not found");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: channel.serverId,
      },
    },
  });

  if (!membership) {
    throw createForbidden("You are not a member of this server");
  }

  return { channel, membership };
}

export async function startCall(userId: string, input: StartCallInput) {
  const { channel } = await ensureChannelMembership(userId, input.channelId);

  const existing = await prisma.callSession.findFirst({
    where: {
      channelId: channel.id,
      active: true,
    },
    select: callSessionSelect,
  });

  if (existing) {
    return existing;
  }

  const session = await prisma.callSession.create({
    data: {
      channelId: channel.id,
      createdById: userId,
      participants: {
        create: {
          userId,
        },
      },
    },
    select: callSessionSelect,
  });

  try {
    const io = getSocketServer();
    io.to(`call:${channel.id}`).emit("call:started", { session });
  } catch {
    // ignore if socket server unavailable
  }

  return session;
}

export async function joinCall(userId: string, input: CallSessionInput) {
  const session = await prisma.callSession.findUnique({
    where: { id: input.sessionId },
    select: callSessionSelect,
  });

  if (!session || !session.active) {
    throw createNotFound("Call session not found");
  }

  await ensureChannelMembership(userId, session.channelId);

  const participant = await prisma.callParticipant.upsert({
    where: {
      sessionId_userId: {
        sessionId: session.id,
        userId,
      },
    },
    update: {
      leftAt: null,
    },
    create: {
      sessionId: session.id,
      userId,
    },
    select: {
      id: true,
      userId: true,
      joinedAt: true,
      leftAt: true,
    },
  });

  try {
    const io = getSocketServer();
    io.to(`call:${session.channelId}`).emit("call:participant-joined", {
      sessionId: session.id,
      userId,
    });
  } catch {
    // ignore
  }

  return participant;
}

export async function leaveCall(userId: string, input: CallSessionInput) {
  const session = await prisma.callSession.findUnique({
    where: { id: input.sessionId },
    select: callSessionSelect,
  });

  if (!session || !session.active) {
    throw createNotFound("Call session not found");
  }

  await prisma.callParticipant.updateMany({
    where: {
      sessionId: session.id,
      userId,
      leftAt: null,
    },
    data: {
      leftAt: new Date(),
    },
  });

  try {
    const io = getSocketServer();
    io.to(`call:${session.channelId}`).emit("call:participant-left", {
      sessionId: session.id,
      userId,
    });
  } catch {
    // ignore
  }
}

export async function endCall(userId: string, input: CallSessionInput) {
  const session = await prisma.callSession.findUnique({
    where: { id: input.sessionId },
    include: {
      channel: {
        select: {
          id: true,
          serverId: true,
        },
      },
    },
  });

  if (!session || !session.active) {
    throw createNotFound("Call session not found");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: session.channel.serverId,
      },
    },
  });

  if (!membership || (membership.role === "member" && session.createdById !== userId)) {
    throw createForbidden("Insufficient permissions to end this call");
  }

  const updatedSession = await prisma.callSession.update({
    where: { id: session.id },
    data: {
      active: false,
      endedAt: new Date(),
    },
    select: callSessionSelect,
  });

  try {
    const io = getSocketServer();
    io.to(`call:${session.channelId}`).emit("call:ended", {
      sessionId: session.id,
    });
  } catch {
    // ignore
  }

  return updatedSession;
}
