import { Router } from "express";
import PostHandler from "../handler/PostHandler";
import verifyToken from "../middleware/verifyToken";

const router = Router();

// Protected routes
router.use(verifyToken); // Apply auth middleware to all routes below

// Feed and user-specific routes (require user dni in params)
router.get("/feed/:dni/:section_code?", PostHandler.getFeed);
router.get("/user/:dni", PostHandler.getUserPosts);
router.get("/saved/:dni", PostHandler.getSavedPosts);

// CRUD operations
router.post("/:dni", PostHandler.create);
router.put("/:code/:dni", PostHandler.update);
router.delete("/:code/:dni", PostHandler.delete);

// Interaction routes (require user dni in body)
router.post("/:code/like", PostHandler.toggleLike);
router.post("/:code/save", PostHandler.toggleSave);
router.patch("/:code/commentable/:dni", PostHandler.toggleCommentable);

export default router;
