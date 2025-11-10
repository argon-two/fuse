import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createServerSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(64).regex(slugRegex).optional(),
  description: z.string().max(500).optional(),
  host: z.string().min(3).max(255).optional(),
  port: z.coerce.number().int().min(1).max(65535).optional(),
});

export const updateServerSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  host: z.string().min(3).max(255).optional(),
  port: z.coerce.number().int().min(1).max(65535).optional(),
  iconUrl: z.string().url().optional().nullable(),
});

export const joinServerSchema = z.object({
  inviteCode: z.string().min(6).max(64).optional(),
});

export type CreateServerInput = z.infer<typeof createServerSchema>;
export type UpdateServerInput = z.infer<typeof updateServerSchema>;
export type JoinServerInput = z.infer<typeof joinServerSchema>;
