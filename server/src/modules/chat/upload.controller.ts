import type { Request, Response } from "express";
import path from "path";
import { asyncHandler } from "../../utils/async-handler";
import { createBadRequest } from "../../utils/errors";
import { config } from "../../config/env";

export const uploadFilesHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createBadRequest("Missing user context");
  }

  const files = (req.files as Express.Multer.File[]) ?? [];

  if (!files.length) {
    throw createBadRequest("No files uploaded");
  }

  const uploads = files.map((file) => {
    const relative = path.relative(path.resolve(config.fileStoragePath), file.path);
    return {
      id: file.filename,
      url: `/uploads/${relative.replace(/\\/g, "/")}`,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  });

  res.status(201).json({ files: uploads });
});
