import { Router } from "express";
import CommentHandler from "../handler/CommentHandler";

const router = Router();

// Public route for fetching comments
router.get("/post/:post_code", CommentHandler.getPostComments);

export default router;
