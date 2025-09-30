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
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Media serving routes (no auth required for direct browser access)
router.get("/image/:code", asyncHandler(serveImage));
router.get("/stream/:code", asyncHandler(streamVideo));
router.get("/download/:code", asyncHandler(downloadFile));

// All other file routes require authentication
router.use(verifyToken);

// File operations
router.get("/:code", asyncHandler(fetchByCode));
router.post("/directory", asyncHandler(createDir));
router.post("/upload", asyncHandler(storeFile));
router.put("/update", asyncHandler(update));
router.put("/tag", asyncHandler(updateTag));
router.delete("/:code", asyncHandler(deleteFile));

// File browsing
router.get("/user/:dni/:parent_code/:onlydir", asyncHandler(fetchByUser));
router.get("/search/:dni/:query", asyncHandler(search));
router.get("/special/:dni/:mode", asyncHandler(fetchRecentOrHeavy));
router.get("/tag/:dni/:tag", asyncHandler(fetchByTag));

// Storage management
router.get("/usage/:dni", asyncHandler(fetchSumSize));
router.get("/trash/:dni", asyncHandler(fetchByTrash));
router.post("/:code/trash", asyncHandler(moveToTrash));
router.delete("/trash/:dni", asyncHandler(cleanTrash));

// Sharing
router.get("/shared-with-me/:dni/:section_code", asyncHandler(fetchSharedWithMe));
router.get("/shared-by-me/:dni", asyncHandler(fetchSharedByMe));

export default router;
