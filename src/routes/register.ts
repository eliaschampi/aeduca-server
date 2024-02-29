import { Router } from "express";
import {
  fetchBySection,
  countBySection,
  fetchScoreReport
} from "../handler/RegisterHandler";

const router = Router();

router.get("/student/:section_code", fetchBySection);
router.get("/count/:section_code", countBySection);
router.get("/score/:lesson_code/:section_code/:skip", fetchScoreReport);

export default router;
