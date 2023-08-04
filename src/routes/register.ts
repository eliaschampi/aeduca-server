import { Router } from "express";
import { fetchBySection } from "../handler/RegisterHandler";

const router = Router();

router.get("/student/:section_code", fetchBySection);

export default router;
