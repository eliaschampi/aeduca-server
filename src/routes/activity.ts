import { Router } from "express";
import { fetchBySection } from "../handler/ActivityHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/:section_code/:register_code", asyncHandler(fetchBySection));

export default router;
