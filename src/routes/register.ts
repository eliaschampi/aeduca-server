import { Router } from "express";
import { fetchBySection, countBySection } from "../handler/RegisterHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/student/:section_code", asyncHandler(fetchBySection));
router.get("/count/:section_code", asyncHandler(countBySection));

export default router;
