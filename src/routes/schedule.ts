import { Router } from "express";
import { fetchBySection, fetchByTeacher } from "../handler/ScheduleHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/section/:section_code", asyncHandler(fetchBySection));
router.get("/teacher/:teacher_dni", asyncHandler(fetchByTeacher));

export default router;
