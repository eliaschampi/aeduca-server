import { Router } from "express";
import { updateDescription, updatePassword } from "../handler/ProfileHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.put("/", asyncHandler(updateDescription));
router.put("/password", asyncHandler(updatePassword));

export default router;
