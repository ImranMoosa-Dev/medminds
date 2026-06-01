import express from "express";
import {
  getSubtopics,
  getSubtopicsByTopic,
  getSubtopicById,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
} from "../controllers/subTopicControllers.js";

const subtopicRoutes = express.Router();

subtopicRoutes.get("/", getSubtopics);
subtopicRoutes.get("/:id", getSubtopicById);
// get sub-topics by topic id
subtopicRoutes.post("/by-topics", getSubtopicsByTopic);
subtopicRoutes.post("/create", createSubtopic);
subtopicRoutes.put("/update/:id", updateSubtopic);
subtopicRoutes.delete("/delete/:id", deleteSubtopic);

export default subtopicRoutes;
