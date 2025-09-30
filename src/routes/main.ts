import { Router } from "express";
import {
  fetchBranch,
  fetchCoursesBySpe,
  fetchSupportByFromAndType,
  sendVerificationCode,
  storeSupport
} from "../handler/MainHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/verificate", asyncHandler(sendVerificationCode));
router.get("/branch/:dni", asyncHandler(fetchBranch));
router.get("/:from/:type", asyncHandler(fetchSupportByFromAndType));
router.get("/", asyncHandler(fetchCoursesBySpe));
router.post("/", asyncHandler(storeSupport));

export default router;
