import express from "express";
import {
  getSubtopics,
  getSubtopicsByTopic,
  getSubtopicById,
  createSubtopic,
  updateSubtopic,
  deleteSubtopic,
} from "../controllers/subtopicController.js";

const subtopicRoutes = express.Router();

subtopicRoutes.get("/", getSubtopics);
subtopicRoutes.get("/:id", getSubtopicById);
subtopicRoutes.get("/topic/:topic_id", getSubtopicsByTopic);
subtopicRoutes.post("/create", createSubtopic);
subtopicRoutes.put("/update/:id", updateSubtopic);
subtopicRoutes.delete("/delete/:id", deleteSubtopic);

export default subtopicRoutes;
