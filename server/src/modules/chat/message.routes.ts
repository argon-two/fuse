import { Router } from "express";
import { listMessagesHandler, sendMessageHandler } from "./message.controller";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

router.use(requireAuth);
router.post("/", sendMessageHandler);
router.get("/channel/:channelId", listMessagesHandler);

export const messageRouter = router;
