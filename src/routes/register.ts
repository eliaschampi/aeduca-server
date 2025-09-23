import { Router } from "express";
import { fetchBySection, countBySection } from "../handler/RegisterHandler";

const router = Router();

router.get("/student/:section_code", fetchBySection);
router.get("/count/:section_code", countBySection);

export default router;
