import { Router } from "express";
import CommentHandler from "../handler/CommentHandler";
import verifyToken from "../middleware/verifyToken";

const router = Router();

// Public routes
router.get("/post/:post_code", CommentHandler.getPostComments);
router.get("/post/:post_code/count", CommentHandler.getCommentCount);
router.get("/:code", CommentHandler.getById);
router.get("/:code/thread", CommentHandler.getThread);

// Protected routes
router.use(verifyToken); // Apply auth middleware to all routes below

// CRUD operations
router.post("/:dni", CommentHandler.create);
router.put("/:code/:dni", CommentHandler.update);
router.delete("/:code/:dni", CommentHandler.delete);

// Reply to comment
router.post("/:code/reply/:dni", CommentHandler.reply);

// User-specific routes
router.get("/user/:dni", CommentHandler.getUserComments);

export default router;
