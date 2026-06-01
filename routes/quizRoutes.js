import { Router } from "express";
import { requireSignIn } from "../middleware/authMiddleware.js";
import {
  createQuizController,
  getAllQuizzesController,
  getQuizByIdController,
  saveQuizProgressController,
  startQuizController,
  submitQuizController,
  getQuizResultController,
} from "../controllers/quizControllers.js";

const quizRoutes = Router();

// get all quizzes
quizRoutes.get("/", getAllQuizzesController);

// get single quiz by id
quizRoutes.get("/quiz/:qId", requireSignIn, getQuizByIdController);

// get quiz and other required details for starting quiz
quizRoutes.get("/start/:quizId", requireSignIn, startQuizController);

// create quiz
quizRoutes.post("/create", requireSignIn, createQuizController);

// save quiz attempt's progress on going quiz
quizRoutes.put(
  "/save-progress/:quizId",
  requireSignIn,
  saveQuizProgressController,
);

// submit quiz answers and calculate result
quizRoutes.post("/submit/:attemptId", requireSignIn, submitQuizController);

// get quiz attempt result
quizRoutes.get("/result/:attemptId", requireSignIn, getQuizResultController);

export default quizRoutes;
