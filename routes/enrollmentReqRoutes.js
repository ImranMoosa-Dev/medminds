import { Router } from "express";

import { requireSignIn } from "../middleware/authMiddleware.js";
import {
  createEnrollmentRequestController,
  getMyEnrollmentRequestStatusController,
} from "../controllers/enrollmentReqControllers.js";

const enrollmentReqRouter = Router();

// CREATE ENROLLMENT REQUEST
enrollmentReqRouter.post(
  "/create",
  requireSignIn,
  createEnrollmentRequestController,
);

// GET MY ENROLLMENT REQUEST STATUS
enrollmentReqRouter.get(
  "/my-status",
  requireSignIn,
  getMyEnrollmentRequestStatusController,
);

export default enrollmentReqRouter;
