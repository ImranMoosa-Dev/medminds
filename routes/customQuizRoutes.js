import { Router } from "express";
import { requireSignIn } from "../middleware/authMiddleware.js";
import {
  createCustomTest,
  getCustomResultController,
  getCustomTestDetails,
  saveCustomProgressController,
  startCustomQuizController,
  submitCustomQuizController,
  submitCustomTest,
} from "../controllers/customQuizControllers.js";

const customQuizRoutes = Router();

// Create custom quiz
customQuizRoutes.post("/create", requireSignIn, createCustomTest);

// Get custom quiz details
customQuizRoutes.get("/:attemptId", requireSignIn, getCustomTestDetails);

// Submit custom quiz answers and calculate result
customQuizRoutes.post("/submit/:id", requireSignIn, submitCustomTest);

// Submit custom quiz
customQuizRoutes.post(
  "/submit/:attemptId",
  requireSignIn,
  submitCustomQuizController,
);

// Save custom quiz attempt's progress
customQuizRoutes.put(
  "/save-progress/:attemptId",
  requireSignIn,
  saveCustomProgressController,
);

// Get Custom Quiz Result
customQuizRoutes.get(
  "/result/:attemptId",
  requireSignIn,
  getCustomResultController,
);

// get quiz and other required details for starting custom quiz
customQuizRoutes.get(
  "/start/:attemptId",
  requireSignIn,
  startCustomQuizController,
);

// Submit Custom Quiz
customQuizRoutes.post(
  "/submit/:attemptId",
  requireSignIn,
  submitCustomQuizController,
);

export default customQuizRoutes;
