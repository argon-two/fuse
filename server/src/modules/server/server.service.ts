import { prisma } from "../../lib/prisma";
import { createConflict, createForbidden, createNotFound } from "../../utils/errors";
import { slugify } from "../../utils/slugify";
import type { CreateServerInput, JoinServerInput, UpdateServerInput } from "./server.schema";
import { ChannelType } from "../../generated/prisma/client";

async function generateUniqueSlug(base: string) {
  let candidate = slugify(base);
  if (!candidate) {
    candidate = `server-${Math.random().toString(36).slice(2, 8)}`;
  }

  let counter = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await prisma.serverInstance.findUnique({ where: { slug: candidate } });
    if (!exists) {
      return candidate;
    }

    candidate = `${candidate}-${counter++}`;
    if (candidate.length > 64) {
      candidate = candidate.slice(0, 64);
    }
  }
}

const serverSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  host: true,
  port: true,
  iconUrl: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
};

export async function createServer(userId: string, data: CreateServerInput) {
  const slug = data.slug ? slugify(data.slug) : await generateUniqueSlug(data.name);

  const existing = await prisma.serverInstance.findUnique({ where: { slug } });
  if (existing) {
    throw createConflict("Server slug already exists");
  }

  const server = await prisma.serverInstance.create({
    data: {
      name: data.name,
      slug,
      description: data.description ?? null,
      host: data.host ?? null,
      port: data.port ?? null,
      createdById: userId,
      memberships: {
        create: {
          userId,
          role: "owner",
        },
      },
      channels: {
        create: [
          {
            name: "general",
            description: "Основной текстовый канал",
            type: ChannelType.TEXT,
            position: 0,
          },
          {
            name: "voice",
            description: "Основной голосовой канал",
            type: ChannelType.VOICE,
            position: 1,
          },
        ],
      },
    },
    select: {
      ...serverSelect,
      channels: {
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          position: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  return server;
}

export async function listServers(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      server: {
        select: serverSelect,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return memberships.map((membership) => ({
    ...membership.server,
    role: membership.role,
  }));
}

export async function getServerBySlug(userId: string, slug: string) {
  const server = await prisma.serverInstance.findUnique({
    where: { slug },
    select: {
      ...serverSelect,
      channels: {
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          position: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!server) {
    throw createNotFound("Server not found");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: server.id,
      },
    },
  });

  if (!membership) {
    throw createForbidden("You are not a member of this server");
  }

  return {
    ...server,
    role: membership.role,
  };
}

export async function joinServer(userId: string, slug: string, _data: JoinServerInput) {
  const server = await prisma.serverInstance.findUnique({
    where: { slug },
    select: serverSelect,
  });

  if (!server) {
    throw createNotFound("Server not found");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: server.id,
      },
    },
  });

  if (membership) {
    return { ...server, role: membership.role };
  }

  const newMembership = await prisma.membership.create({
    data: {
      userId,
      serverId: server.id,
      role: "member",
    },
  });

  return { ...server, role: newMembership.role };
}

export async function updateServer(userId: string, slug: string, data: UpdateServerInput) {
  const server = await prisma.serverInstance.findUnique({
    where: { slug },
  });

  if (!server) {
    throw createNotFound("Server not found");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: server.id,
      },
    },
  });

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    throw createForbidden("Insufficient permissions");
  }

  const updated = await prisma.serverInstance.update({
    where: { id: server.id },
    data: {
      name: data.name ?? server.name,
      description: data.description ?? server.description,
      host: data.host ?? server.host,
      port: data.port ?? server.port,
      iconUrl: data.iconUrl ?? server.iconUrl,
    },
    select: serverSelect,
  });

  return updated;
}
