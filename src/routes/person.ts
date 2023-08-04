import { Router } from "express";
import { changeEmail, fetchLikers, finder } from "../handler/PersonHandler";

const router = Router();

router.get("/likers/bydni/:dnis", fetchLikers);
router.get("/query/:query", finder);
router.put("/email", changeEmail);

export default router;
