import { Router } from "express";
import {
  updateDescription,
  updateImage,
  updatePassword
} from "../handler/ProfileHandler";

const router = Router();

router.put("/", updateDescription);
router.put("/password", updatePassword);
router.put("/image/:dni", updateImage);

export default router;
