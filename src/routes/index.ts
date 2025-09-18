import { Router } from "express";

// Import route modules
import activity from "./activity";
import attendance from "./attendance";
import auth from "./auth";
import calification from "./calification";
import comment from "./comment";
import content from "./content";
import file from "./file";
import fileshare from "./fileshare";
import lesson from "./lesson";
import main from "./main";
import op from "./op";
import payment from "./payment";
import person from "./person";
import post from "./post";
import profile from "./profile";
import register from "./register";
import response from "./response";
import schedule from "./schedule";
import score from "./score";
import section from "./section";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount route modules
router.use("/activity", activity);
router.use("/attendance", attendance);
router.use("/auth", auth);
router.use("/calification", calification);
router.use("/comment", comment);
router.use("/content", content);
router.use("/file", file);
router.use("/fileshare", fileshare);
router.use("/lesson", lesson);
router.use("/main", main);
router.use("/op", op);
router.use("/payment", payment);
router.use("/person", person);
router.use("/post", post);
router.use("/profile", profile);
router.use("/register", register);
router.use("/response", response);
router.use("/schedule", schedule);
router.use("/score", score);
router.use("/section", section);

// 404 handler for unknown API routes
router.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Not Found",
    message: "The requested API endpoint does not exist",
    path: req.originalUrl
  });
});

export default router;
