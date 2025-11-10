import { prisma } from "../../lib/prisma";
import { createForbidden, createNotFound } from "../../utils/errors";
import type { CreateChannelInput, UpdateChannelInput } from "./channel.schema";
import { ChannelType } from "../../generated/prisma/client";

const channelSelect = {
  id: true,
  name: true,
  description: true,
  type: true,
  position: true,
  serverId: true,
};

async function ensureMembership(userId: string, serverId: string) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId,
      },
    },
  });

  if (!membership) {
    throw createForbidden("You are not a member of this server");
  }

  return membership;
}

export async function createChannel(userId: string, input: CreateChannelInput) {
  const server = await prisma.serverInstance.findUnique({
    where: { slug: input.serverSlug },
    select: {
      id: true,
      channels: {
        select: {
          position: true,
        },
      },
    },
  });

  if (!server) {
    throw createNotFound("Server not found");
  }

  const membership = await ensureMembership(userId, server.id);

  if (membership.role === "member" && input.type === ChannelType.VOICE) {
    throw createForbidden("Только администраторы могут создавать голосовые каналы");
  }

  if (membership.role === "member") {
    throw createForbidden("Insufficient permissions");
  }

  const maxPosition = server.channels.reduce((acc, channel) => Math.max(acc, channel.position), 0);

  const channel = await prisma.channel.create({
    data: {
      serverId: server.id,
      name: input.name,
      description: input.description ?? null,
      type: input.type,
      position: input.position ?? maxPosition + 1,
    },
    select: channelSelect,
  });

  return channel;
}

export async function updateChannel(userId: string, channelId: string, input: UpdateChannelInput) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: channelSelect,
  });

  if (!channel) {
    throw createNotFound("Channel not found");
  }

  const membership = await ensureMembership(userId, channel.serverId);
  if (membership.role === "member") {
    throw createForbidden("Insufficient permissions");
  }

  const updated = await prisma.channel.update({
    where: { id: channelId },
    data: {
      name: input.name ?? channel.name,
      description: input.description ?? channel.description,
      position: input.position ?? channel.position,
    },
    select: channelSelect,
  });

  return updated;
}

export async function getChannel(userId: string, channelId: string) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    select: channelSelect,
  });

  if (!channel) {
    throw createNotFound("Channel not found");
  }

  await ensureMembership(userId, channel.serverId);

  return channel;
}
