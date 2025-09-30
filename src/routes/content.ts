import { Router } from "express";
import { fetchByLesson } from "../handler/ContentHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/:lesson_code", asyncHandler(fetchByLesson));

export default router;
