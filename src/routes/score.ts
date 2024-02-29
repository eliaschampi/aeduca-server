import { Router } from "express";
import { updateOrCreate, removeScore } from "../handler/ScoreHandler";

const router = Router();

router.put("/", updateOrCreate);
router.delete("/:lesson_code/:register_code", removeScore);

export default router;
