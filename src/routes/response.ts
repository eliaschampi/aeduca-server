import { Router } from "express";
import {
  fetchByRegister,
  sendActivity,
  toggleReceived,
  fetchByLessonAndSection
} from "../handler/ResponseHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/:lesson_code/:register_code", asyncHandler(fetchByRegister));
router.get("/report/:lesson_code/:section_code", asyncHandler(fetchByLessonAndSection));
router.put("/:lesson_code/:register_code", asyncHandler(toggleReceived));
router.post("/", asyncHandler(sendActivity));

export default router;
