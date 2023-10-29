import { Router } from "express";
import { fetchByLesson } from "../handler/ContentHandler";
const router = Router();

router.get("/:lesson_code", fetchByLesson);

export default router;
