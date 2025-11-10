import { Router } from "express";
import {
  endCallHandler,
  joinCallHandler,
  leaveCallHandler,
  startCallHandler,
} from "./call.controller";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

router.use(requireAuth);
router.post("/start", startCallHandler);
router.post("/join", joinCallHandler);
router.post("/leave", leaveCallHandler);
router.post("/end", endCallHandler);

export const callRouter = router;
