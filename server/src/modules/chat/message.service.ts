import type { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { createForbidden, createNotFound } from "../../utils/errors";
import type { ListMessagesInput, SendMessageInput } from "./message.schema";
import { getSocketServer } from "../../lib/socket";

const messageSelect = {
  id: true,
  content: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  channelId: true,
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },
  attachments: {
    select: {
      id: true,
      url: true,
      fileName: true,
      mimeType: true,
      size: true,
    },
  },
};

async function ensureMembership(userId: string, channelId: string) {
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

  return channel;
}

export async function sendMessage(userId: string, input: SendMessageInput) {
  const channel = await ensureMembership(userId, input.channelId);

  const metadataValue = input.metadata as Prisma.InputJsonValue | undefined;

  const message = await prisma.$transaction(async (tx) => {
    const createdMessage = await tx.message.create({
      data: {
        channelId: input.channelId,
        authorId: userId,
        content: input.content ?? "",
        ...(typeof metadataValue !== "undefined" ? { metadata: metadataValue } : {}),
      },
      select: {
        id: true,
      },
    });

    if (input.attachments?.length) {
      await tx.attachment.createMany({
        data: input.attachments.map((attachment) => ({
          messageId: createdMessage.id,
          uploaderId: userId,
          url: attachment.url,
          fileName: attachment.fileName,
          mimeType: attachment.mimeType,
          size: attachment.size,
        })),
      });
    }

    return tx.message.findUniqueOrThrow({
      where: { id: createdMessage.id },
      select: messageSelect,
    });
  });

  try {
    const io = getSocketServer();
    io.to(`channel:${channel.id}`).emit("chat:message", {
      channelId: channel.id,
      message,
    });
  } catch {
    // socket server might be unavailable during tests
  }

  return message;
}

export async function listMessages(userId: string, channelId: string, query: ListMessagesInput) {
  const channel = await ensureMembership(userId, channelId);

  const items = await prisma.message.findMany({
    where: {
      channelId: channel.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: query.limit + 1,
    ...(query.cursor
      ? {
          cursor: {
            id: query.cursor,
          },
          skip: 1,
        }
      : {}),
    select: messageSelect,
  });

  let nextCursor: string | undefined;
  if (items.length > query.limit) {
    const nextItem = items.pop();
    nextCursor = nextItem?.id;
  }

  return {
    messages: items.reverse(),
    nextCursor,
  };
}
