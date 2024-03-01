import { Router } from "express";
import {
  fetchByRegister,
  sendActivity,
  toggleReceived,
  fetchByLessonAndSection
} from "../handler/ResponseHandler";

const router = Router();

router.get("/:lesson_code/:register_code", fetchByRegister);
router.get("/report/:lesson_code/:section_code", fetchByLessonAndSection);
router.put("/:lesson_code/:register_code", toggleReceived);
router.post("/", sendActivity);

export default router;
