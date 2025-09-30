import { Router } from "express";
import { updateDescription, updatePassword } from "../handler/ProfileHandler";

const router = Router();

router.put("/", updateDescription);
router.put("/password", updatePassword);

export default router;
