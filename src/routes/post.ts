import { Router } from "express";
import {
  createNewPost,
  destroyPost,
  fetchCount,
  fetchMain,
  fixedPost,
  savePost,
  updatePost
} from "../handler/PostHandler";

const router = Router();

router.get("/:dni/:skip/:take/:uid", fetchMain);
router.get("/count/:dni/:uid", fetchCount);
router.post("/", createNewPost);
router.put("/:_id", updatePost);
router.put("/fixed/:_id", fixedPost);
router.put("/saved/:_id", savePost);
router.delete("/:post_id/:socketId", destroyPost);

export default router;
