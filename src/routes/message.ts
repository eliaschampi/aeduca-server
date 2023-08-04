import { Router } from "express";
import {
  destroy,
  downloadAudio,
  fetchByRoom,
  uploadAudio
} from "../handler/MessageHandler";

const router = Router();

router.get("/:room/:dni/:skip/:take", fetchByRoom);
router.delete("/:_id/:dni/:everybody", destroy);
router.get("/sound/:room/:url", downloadAudio);
router.post("/sound", uploadAudio);

export default router;
