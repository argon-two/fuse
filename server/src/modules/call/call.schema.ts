import { z } from "zod";

export const startCallSchema = z.object({
  channelId: z.string().cuid(),
});

export const callSessionSchema = z.object({
  sessionId: z.string().cuid(),
});

export type StartCallInput = z.infer<typeof startCallSchema>;
export type CallSessionInput = z.infer<typeof callSessionSchema>;
