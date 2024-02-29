import { Router } from "express";
import {
  cleanTrash,
  createDir,
  deleteFile,
  downloadFile,
  fetchByTag,
  fetchByTrash,
  fetchByUser,
  fetchRecentOrHeavy,
  fetchShared,
  fetchSumSize,
  search,
  storeFile,
  update,
  fetchByCode
} from "../handler/FileHandler";

const router = Router();

router.get("/file/:code", fetchByCode);
router.get("/file/:dni/:query", search);
router.get("/all_files/:dni/:parent_code/:onlydir?", fetchByUser);
router.get("/rh_files/:dni/:mode", fetchRecentOrHeavy);
router.get("/tag_files/:dni/:tag", fetchByTag);
router.get("/sum_files/:dni", fetchSumSize);
router.get("/trash_files/:dni", fetchByTrash);
router.get("/shared_files/:dni/:section_code?", fetchShared);
router.post("/file/dir", createDir);
router.post("/file", storeFile);
router.put("/file", update);
router.delete("/file/:code", deleteFile);
router.delete("/trash/:dni", cleanTrash);
router.get("/dw_file/:code", downloadFile);

export default router;
