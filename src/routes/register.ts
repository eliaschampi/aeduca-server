import { Router } from "express";
import { fetchBySection, fetchCount } from "../handler/RegisterHandler";

const router = Router();

router.get("/student/:section_code", fetchBySection);
router.get("/count/:section_code", fetchCount);

export default router;
