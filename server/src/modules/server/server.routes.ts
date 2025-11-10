import { Router } from "express";
import {
  createServerHandler,
  getServerHandler,
  joinServerHandler,
  listServersHandler,
  updateServerHandler,
} from "./server.controller";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

router.use(requireAuth);
router.post("/", createServerHandler);
router.get("/", listServersHandler);
router.get("/:slug", getServerHandler);
router.post("/:slug/join", joinServerHandler);
router.patch("/:slug", updateServerHandler);

export const serverRouter = router;
