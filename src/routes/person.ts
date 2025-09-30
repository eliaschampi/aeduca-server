import { Router } from "express";
import { changeEmail, fetchLikers, finder } from "../handler/PersonHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/likers/bydni/:dnis", asyncHandler(fetchLikers));
router.get("/query/:query", asyncHandler(finder));
router.put("/email", asyncHandler(changeEmail));

export default router;
