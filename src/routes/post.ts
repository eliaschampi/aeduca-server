import { Router } from "express";
import { getFeed, toggleCommentable } from "../handler/PostHandler";
import verifyToken from "../middleware/verifyToken";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Protected routes
router.use(verifyToken); // Apply auth middleware to all routes below

// Feed route
router.get("/feed/:dni/:section_code?", asyncHandler(getFeed));

// Toggle commentable (HTTP endpoint for non-realtime usage)
router.patch("/:code/commentable/:dni", asyncHandler(toggleCommentable));

export default router;
