import { Router } from "express";
import {
  deleteUnit,
  fetchByCode,
  fetchByOp,
  fetchCurrent,
  storeUnit,
  updateUnit
} from "../handler/UnitHandler";

const router = Router();

router.get("/:code", fetchByCode);
router.get("/op/:op_code", fetchByOp);
router.get("/current/:op_code", fetchCurrent);
router.post("/", storeUnit);
router.put("/:code", updateUnit);
router.delete("/:code", deleteUnit);

export default router;
