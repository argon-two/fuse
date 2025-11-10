import { z } from "zod";
import { ChannelType } from "../../generated/prisma/client";

export const createChannelSchema = z.object({
  serverSlug: z.string().min(3),
  name: z.string().min(1).max(100),
  description: z.string().max(255).optional(),
  type: z.nativeEnum(ChannelType).default(ChannelType.TEXT),
  position: z.number().int().min(0).optional(),
});

export const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(255).optional(),
  position: z.number().int().min(0).optional(),
});

export type CreateChannelInput = z.infer<typeof createChannelSchema>;
export type UpdateChannelInput = z.infer<typeof updateChannelSchema>;
