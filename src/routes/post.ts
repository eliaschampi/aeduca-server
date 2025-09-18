import { Router } from "express";
import PostHandler from "../handler/PostHandler";
import verifyToken from "../middleware/verifyToken";

const router = Router();

// Public routes (with optional auth for enhanced features)
router.get("/feed", verifyToken, PostHandler.getFeed);
router.get("/search", PostHandler.search);
router.get("/:code", PostHandler.getById);
router.get("/:code/stats", PostHandler.getStats);

// Protected routes
router.use(verifyToken); // Apply auth middleware to all routes below

// CRUD operations
router.post("/", PostHandler.create);
router.put("/:code", PostHandler.update);
router.delete("/:code", PostHandler.delete);

// User-specific routes
router.get("/user/:dni", PostHandler.getUserPosts);
router.get("/saved", PostHandler.getSavedPosts);

// Interaction routes
router.post("/:code/like", PostHandler.toggleLike);
router.post("/:code/save", PostHandler.toggleSave);

// Admin routes
router.patch("/:code/approve", PostHandler.setApproval);

export default router;
