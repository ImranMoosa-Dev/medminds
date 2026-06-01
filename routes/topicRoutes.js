import express from "express";
import {
  getTopics,
  getTopicsBySubject,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topicControllers.js";

const topicRoutes = express.Router();

topicRoutes.get("/", getTopics);
topicRoutes.get("/:id", getTopicById);
// get topics by subject id
topicRoutes.post("/by-subjects", getTopicsBySubject);
topicRoutes.post("/create", createTopic);
topicRoutes.put("/update/:id", updateTopic);
topicRoutes.delete("/delete/:id", deleteTopic);

export default topicRoutes;
