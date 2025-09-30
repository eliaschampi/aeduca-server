import { Router } from "express";
import { auth, recoverPassword } from "../handler/AuthHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/login", asyncHandler(auth));
router.put("/recover", asyncHandler(recoverPassword));

export default router;
