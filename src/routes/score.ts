import { Router } from "express";
import { fetchBySection, updateOrCreate, removeScore } from "../handler/ScoreHandler";

const router = Router();

router.put("/", updateOrCreate);
router.get("/:lesson_code/:section_code/:type/:skip", fetchBySection);
router.delete("/:lesson_code/:register_code", removeScore);

export default router;
