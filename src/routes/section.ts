import { Router } from "express";
import { fetchByTeacher } from "../handler/SectionHandler";

const router = Router();
router.get("/teacher/:teacher_dni", fetchByTeacher);

export default router;
