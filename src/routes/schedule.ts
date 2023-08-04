import { Router } from "express";
import { fetchBySection, fetchByTeacher } from "../handler/ScheduleHandler";

const router = Router();

router.get("/section/:section_code", fetchBySection);
router.get("/teacher/:teacher_dni", fetchByTeacher);

export default router;
