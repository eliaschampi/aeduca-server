import { Router } from "express";
import { getPostComments } from "../handler/CommentHandler";

const router = Router();

// Public route for fetching comments
router.get("/post/:post_code", getPostComments);

export default router;
