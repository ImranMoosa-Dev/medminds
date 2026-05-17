import express from "express";
import {
  getTopics,
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topicController.js";

const topicRoutes = express.Router();

topicRoutes.get("/", getTopics);
topicRoutes.get("/:id", getTopicById);
topicRoutes.get("/subject/:subject_id", getTopicsBySubject);
topicRoutes.post("/create", createTopic);
topicRoutes.put("/update/:id", updateTopic);
topicRoutes.delete("/delete/:id", deleteTopic);

export default topicRoutes;
