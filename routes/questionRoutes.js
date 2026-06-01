import { Router } from "express";
import { getQuestionsCountBySubtopicsController } from "../controllers/questionControllers.js";

const questionRoutes = Router();

// get questions count by subtopic id
questionRoutes.post("/count", getQuestionsCountBySubtopicsController);

export default questionRoutes;
