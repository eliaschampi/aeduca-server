import { Router } from "express";
import { fetchByCode, fetchBySection, fetchByTeacher } from "../handler/OpHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/:code", asyncHandler(fetchByCode));
router.get("/section/:section_code", asyncHandler(fetchBySection));
router.get("/teacher/:teacher_dni", asyncHandler(fetchByTeacher));

export default router;
