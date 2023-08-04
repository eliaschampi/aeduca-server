import { Router } from "express";
import { fetchSharedEntities, removeFs, storeFs } from "../handler/FileshareHandler";

const router = Router();

router.get("/:file_code", fetchSharedEntities);
router.post("/", storeFs);
router.delete("/:code", removeFs);

export default router;
