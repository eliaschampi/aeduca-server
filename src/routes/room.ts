import { Router } from "express";
import {
  createGroup,
  createNewRoom,
  destroy,
  fetchByPerson,
  findByCpa,
  toggleCpa,
  togglemember
} from "../handler/RoomHandler";

const router = Router();

router.get("/:dni", fetchByPerson);
router.get("/find/:cpa", findByCpa);
router.post("/", createGroup);
router.post("/simple", createNewRoom);
router.put("/togglemember", togglemember);
router.put("/:_id", toggleCpa);
router.delete("/:_id/:socketId", destroy);

export default router;
