import { Router } from "express";
import * as lfh from "../handler/LessonFileHandler";
import * as l from "../handler/LessonHandler";
import * as rh from "../handler/ResponseHandler";

const router = Router();

//lesson
router.post("/", l.store);
router.delete("/:code", l.destroy);
router.put("/:code", l.update);
router.get("/:op_code/:user", l.fetchByOp);
router.get("/item/:code/:graph", l.fetchByCode);

// lesson_file
router.get("/file/:lesson_code", lfh.fetchLessonFiles);
router.post("/file", lfh.storeLessonFile);
router.delete("/file/:code", lfh.removeLessonFile);

//response_handler
router.get("/regs/:lesson_code/:register_code", rh.fetchByRegister);
router.put("/regs/:lesson_code/:register_code", rh.toggleReceived);

//activity
router.post("/activity", rh.sendActivity);

export default router;
