import { Router } from "express";

const quizAttemptRoutes = Router();

// get single quiz attempts by attempt id
quizAttemptRoutes.get("/:attemptId");
export default quizAttemptRoutes;
