import { Router } from "express";
import { getFeed, toggleCommentable } from "../handler/PostHandler";
import verifyToken from "../middleware/verifyToken";

const router = Router();

// Protected routes
router.use(verifyToken); // Apply auth middleware to all routes below

// Feed route
router.get("/feed/:dni/:section_code?", getFeed);

// Toggle commentable (HTTP endpoint for non-realtime usage)
router.patch("/:code/commentable/:dni", toggleCommentable);

export default router;
