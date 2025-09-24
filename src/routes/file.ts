import { Router } from "express";
import FileHandler from "../handler/FileHandler";
import verifyToken from "../middleware/verifyToken";

const router = Router();

// Media serving routes (no auth required for direct browser access)
router.get("/image/:code", FileHandler.serveImage);
router.get("/stream/:code", FileHandler.streamVideo);
router.get("/download/:code", FileHandler.downloadFile);

// All other file routes require authentication
router.use(verifyToken);

// File operations
router.get("/:code", FileHandler.fetchByCode);
router.post("/directory", FileHandler.createDir);
router.post("/upload", FileHandler.storeFile);
router.put("/update", FileHandler.update);
router.put("/tag", FileHandler.updateTag);
router.delete("/:code", FileHandler.deleteFile);

// File browsing
router.get("/user/:dni/:parent_code/:onlydir", FileHandler.fetchByUser);
router.get("/search/:dni/:query", FileHandler.search);
router.get("/special/:dni/:mode", FileHandler.fetchRecentOrHeavy);
router.get("/tag/:dni/:tag", FileHandler.fetchByTag);

// Storage management
router.get("/usage/:dni", FileHandler.fetchSumSize);
router.get("/trash/:dni", FileHandler.fetchByTrash);
router.post("/:code/trash", FileHandler.moveToTrash);
router.delete("/trash/:dni", FileHandler.cleanTrash);

// Sharing
router.get("/shared-with-me/:dni/:section_code", FileHandler.fetchSharedWithMe);
router.get("/shared-by-me/:dni", FileHandler.fetchSharedByMe);

export default router;
