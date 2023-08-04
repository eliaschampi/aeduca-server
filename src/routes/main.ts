import { Router } from "express";
import {
  fetchBranch,
  fetchCoursesBySpe,
  fetchSupportByFromAndType,
  sendVerificationCode,
  storeSupport
} from "../handler/MainHandler";

const router = Router();

router.post("/verificate", sendVerificationCode);
router.get("/branch/:dni", fetchBranch);
router.get("/:from/:type", fetchSupportByFromAndType);
router.get("/n/c/spe", fetchCoursesBySpe);
router.post("/", storeSupport);

export default router;
