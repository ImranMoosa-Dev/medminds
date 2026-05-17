import { Router } from "express";
import {
  createSubject,
  deleteSubject,
  getSubjectById,
  getSubjects,
  updateSubject,
} from "../controllers/subjectControllers.js";

const subjectRoutes = Router();

// get all subjects
subjectRoutes.get("/", getSubjects);

// get subject by id
subjectRoutes.get("/:id", getSubjectById);

// create subject
subjectRoutes.post("/create", createSubject);

// update subject
subjectRoutes.put("/update/:id", updateSubject);

// delete subject
subjectRoutes.delete("/delete/:id", deleteSubject);
export default subjectRoutes;
