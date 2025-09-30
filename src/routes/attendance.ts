import { Router } from "express";
import {
  createInspection,
  fetchAttendanceByEntity,
  fetchEntryData,
  storeAttendance,
  storeJustification
} from "../handler/AttendanceHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/entrydata/:cycle_code", asyncHandler(fetchEntryData));
router.get("/entity/:entity_identifier", asyncHandler(fetchAttendanceByEntity));
router.put("/:a_code", asyncHandler(storeJustification));
router.post("/", asyncHandler(storeAttendance));
router.post("/cedp", asyncHandler(createInspection));

export default router;
