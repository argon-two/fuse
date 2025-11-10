import { z } from "zod";

const attachmentSchema = z.object({
  url: z.string().url(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().min(1),
});

export const sendMessageSchema = z
  .object({
    channelId: z.string().cuid(),
    content: z.string().max(4000).optional(),
    attachments: z.array(attachmentSchema).max(10).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((data) => data.content?.trim().length || (data.attachments && data.attachments.length > 0), {
    message: "Message must have text or at least one attachment",
    path: ["content"],
  });

export const listMessagesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().cuid().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListMessagesInput = z.infer<typeof listMessagesSchema>;
