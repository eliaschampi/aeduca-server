import { Router } from "express";
import { fetchSharedEntities, removeFs, storeFs } from "../handler/FileshareHandler";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/:file_code", asyncHandler(fetchSharedEntities));
router.post("/", asyncHandler(storeFs));
router.delete("/:code", asyncHandler(removeFs));

export default router;
