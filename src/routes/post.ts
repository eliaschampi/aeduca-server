import { Router } from "express";
import PostHandler from "../handler/PostHandler";
import verifyToken from "../middleware/verifyToken";

const router = Router();

// Protected routes
router.use(verifyToken); // Apply auth middleware to all routes below

// Feed route
router.get("/feed/:dni/:section_code?", PostHandler.getFeed);

// Toggle commentable (HTTP endpoint for non-realtime usage)
router.patch("/:code/commentable/:dni", PostHandler.toggleCommentable);

export default router;
