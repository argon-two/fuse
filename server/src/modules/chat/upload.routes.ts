import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { requireAuth } from "../../middlewares/require-auth";
import { uploadFilesHandler } from "./upload.controller";
import { config } from "../../config/env";
import { ensureDir } from "../../utils/file";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const dir = path.join(
      path.resolve(config.fileStoragePath),
      `${now.getFullYear()}`,
      `${now.getMonth() + 1}`,
      `${now.getDate()}`,
    );
    ensureDir(dir)
      .then(() => cb(null, dir))
      .catch((error) => cb(error, dir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxUploadBytes,
  },
});

router.use(requireAuth);
router.post("/", upload.array("files", 10), uploadFilesHandler);

export const uploadRouter = router;
