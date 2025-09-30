import { Router } from "express";
import { getPostComments } from "../handler/CommentHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Public route for fetching comments
router.get("/post/:post_code", asyncHandler(getPostComments));

export default router;
