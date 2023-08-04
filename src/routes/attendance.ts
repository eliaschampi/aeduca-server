import { Router } from "express";
import {
  createInspection,
  fetchEntryData,
  storeAttendance,
  storeJustification
} from "../handler/AttendanceHandler";

const router = Router();

router.get("/entrydata/:cycle_code", fetchEntryData);
router.put("/:a_code", storeJustification);
router.post("/", storeAttendance);
router.post("/cedp", createInspection);

export default router;
