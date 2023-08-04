import { Router } from "express";
import {
  createComment,
  deleteComment,
  fetchComments,
  updateComment
} from "../handler/CommentHandler";

const router = Router();

router.get("/:post_id", fetchComments);
router.post("/", createComment);
router.put("/:_id", updateComment);
router.delete("/:_id/:socketId", deleteComment);

export default router;
