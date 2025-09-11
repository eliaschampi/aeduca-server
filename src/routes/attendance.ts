import { Router } from "express";
import {
  createInspection,
  fetchAttendanceByEntity,
  fetchEntryData,
  storeAttendance,
  storeJustification
} from "../handler/AttendanceHandler";

const router = Router();

router.get("/entrydata/:cycle_code", fetchEntryData);
router.get("/entity/:entity_identifier", fetchAttendanceByEntity);
router.put("/:a_code", storeJustification);
router.post("/", storeAttendance);
router.post("/cedp", createInspection);

export default router;
