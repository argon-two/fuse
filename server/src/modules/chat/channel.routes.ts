import { Router } from "express";
import {
  createChannelHandler,
  getChannelHandler,
  updateChannelHandler,
} from "./channel.controller";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

router.use(requireAuth);
router.post("/", createChannelHandler);
router.get("/:channelId", getChannelHandler);
router.patch("/:channelId", updateChannelHandler);

export const channelRouter = router;
