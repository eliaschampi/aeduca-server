import { Router } from "express";
import * as l from "../handler/LessonHandler";

const router = Router();

//lesson
router.post("/", l.store);
router.delete("/:code", l.destroy);
router.put("/:code", l.update);
router.get("/:op_code/:user", l.fetchByOp);
router.get("/item/:code/:graph", l.fetchByCode);

export default router;
