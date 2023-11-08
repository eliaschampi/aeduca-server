import { Router } from "express";
import { fetchBySection } from "../handler/ScoreHandler";

const router = Router();

router.get("/:lesson_code/:section_code/:type/:skip", fetchBySection);

export default router;
