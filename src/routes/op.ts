import { Router } from "express";
import { fetchByCode, fetchBySection, fetchByTeacher } from "../handler/OpHandler";

const router = Router();

router.get("/:code", fetchByCode);
router.get("/section/:section_code", fetchBySection);
router.get("/teacher/:teacher_dni", fetchByTeacher);

export default router;
