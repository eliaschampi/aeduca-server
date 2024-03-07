import { Router } from "express";
import { fetchBySection } from "../handler/ActivityHandler";

const router = Router();

router.get("/:section_code/:register_code", fetchBySection);

export default router;
