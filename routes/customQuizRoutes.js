import { Router } from "express";
import { requireSignIn } from "../middleware/authMiddleware.js";
import {
  createCustomQuizController,
  finalSubmitCustomQuizController,
  getCustomQuizDetailsController,
  getCustomQuizResultController,
  saveCustomQuizProgressController,
  startCustomQuizController,
  getCustomQuizAttemptsHistoryController,
} from "../controllers/customQuizControllers.js";

const customQuizRoutes = Router();

// Create custom quiz
customQuizRoutes.post("/create", requireSignIn, createCustomQuizController);

// Get custom quiz details by attempt ID
customQuizRoutes.get(
  "/details/:attemptId",
  requireSignIn,
  getCustomQuizDetailsController,
);

// Save custom quiz attempt's progress
customQuizRoutes.put(
  "/save-progress/:attemptId",
  requireSignIn,
  saveCustomQuizProgressController,
);

// Get Custom Quiz Result
customQuizRoutes.get(
  "/result/:attemptId",
  requireSignIn,
  getCustomQuizResultController,
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
  finalSubmitCustomQuizController,
);

// 📋 Get all custom test attempts (history)
customQuizRoutes.get(
  "/history",
  requireSignIn,
  getCustomQuizAttemptsHistoryController,
);

export default customQuizRoutes;
