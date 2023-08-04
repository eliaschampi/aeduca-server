import { Router } from "express";
import * as ci from "../handler/CalificationHandler";

const router = Router();

router.put("/item", ci.createOrUpdateItem);
router.put("/sdf", ci.calificateBySdf);
router.delete("/:lesson_code", ci.removeAll);

export default router;
