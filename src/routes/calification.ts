import { Router } from "express";
import * as ci from "../handler/CalificationHandler";

const router = Router();

router.put("/sdf", ci.calificateBySdf);
router.get("/:section_code/:register_code", ci.fetchByRegister);

export default router;
