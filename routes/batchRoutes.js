import { Router } from "express";
import {
  getAllBatchesController,
  getSingleBatchController,
  getMyBatchController,
} from "../controllers/batchControllers.js";

import { requireSignIn } from "../middleware/authMiddleware.js";

const batchRoutes = Router();

// Get all batches
batchRoutes.get("/all", requireSignIn, getAllBatchesController);

// Get single batch with schedule
batchRoutes.get("/:id", requireSignIn, getSingleBatchController);

/*
|--------------------------------------------------------------------------
| STUDENT ROUTES
|--------------------------------------------------------------------------
*/

// Get logged-in student's batch
batchRoutes.get("/student/my-batch", requireSignIn, getMyBatchController);

export default batchRoutes;
