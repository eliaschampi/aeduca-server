import { Router } from "express";
import { auth, recoverPassword } from "../handler/AuthHandler";

const router = Router();

router.post("/login", auth);
router.put("/recover", recoverPassword);

export default router;
