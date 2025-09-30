import { Router } from "express";
import {
  fetchByCode,
  search,
  fetchByUser,
  fetchRecentOrHeavy,
  fetchByTrash,
  fetchByTag,
  fetchSumSize,
  fetchSharedWithMe,
  fetchSharedByMe,
  createDir,
  storeFile,
  updateTag,
  update,
  deleteFile,
  moveToTrash,
  cleanTrash,
  downloadFile,
  streamVideo,
  serveImage
} from "../handler/FileHandler";
import verifyToken from "../middleware/verifyToken";

const router = Router();

// Media serving routes (no auth required for direct browser access)
router.get("/image/:code", serveImage);
router.get("/stream/:code", streamVideo);
router.get("/download/:code", downloadFile);

// All other file routes require authentication
router.use(verifyToken);

// File operations
router.get("/:code", fetchByCode);
router.post("/directory", createDir);
router.post("/upload", storeFile);
router.put("/update", update);
router.put("/tag", updateTag);
router.delete("/:code", deleteFile);

// File browsing
router.get("/user/:dni/:parent_code/:onlydir", fetchByUser);
router.get("/search/:dni/:query", search);
router.get("/special/:dni/:mode", fetchRecentOrHeavy);
router.get("/tag/:dni/:tag", fetchByTag);

// Storage management
router.get("/usage/:dni", fetchSumSize);
router.get("/trash/:dni", fetchByTrash);
router.post("/:code/trash", moveToTrash);
router.delete("/trash/:dni", cleanTrash);

// Sharing
router.get("/shared-with-me/:dni/:section_code", fetchSharedWithMe);
router.get("/shared-by-me/:dni", fetchSharedByMe);

export default router;
