import { Router } from "express";
import { fetchByTeacher } from "../handler/SectionHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();
router.get("/teacher/:teacher_dni", asyncHandler(fetchByTeacher));

export default router;
