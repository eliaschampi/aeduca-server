import { Router } from "express";
import verifyToken from "../middleware/verifyToken";

// import sub-routers
import auth from "./auth";
import section from "./section";
import person from "./person";
import file from "./file";
import profile from "./profile";
import post from "./post";
import attendance from "./attendance";
import op from "./op";
import schedule from "./schedule";
import main from "./main";
import room from "./room";
import message from "./message";
import register from "./register";
import unit from "./unit";
import fileshare from "./fileshare";
import comment from "./comment";
import lesson from "./lesson";
import calification from "./calification";
import { serveImage, streamVideo } from "../handler/FileHandler";

const router = Router();

router.use("/auth", auth);
router.get("/filedinary/stream/:fullpath", streamVideo);
router.get("/filedinary/keseps/:fullpath", serveImage);

router.use("/section", verifyToken, section);
router.use("/person", verifyToken, person);
router.use("/", verifyToken, file);
router.use("/profile", verifyToken, profile);
router.use("/post", verifyToken, post);
router.use("/attendance", verifyToken, attendance);
router.use("/op", verifyToken, op);
router.use("/schedule", verifyToken, schedule);
router.use("/main", verifyToken, main);
router.use("/room", verifyToken, room);
router.use("/message", verifyToken, message);
router.use("/register", verifyToken, register);
router.use("/unit", verifyToken, unit);
router.use("/fileshare", verifyToken, fileshare);
router.use("/comment", verifyToken, comment);
router.use("/lesson", verifyToken, lesson);
router.use("/calification", verifyToken, calification);

export = router;
