import { Router } from "express";
import * as l from "../handler/LessonHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

//lesson
router.post("/", asyncHandler(l.store));
router.delete("/:code", asyncHandler(l.destroy));
router.put("/:code", asyncHandler(l.update));
router.get("/:op_code/:user", asyncHandler(l.fetchByOp));
router.get("/item/:code/:graph", asyncHandler(l.fetchByCode));

export default router;
