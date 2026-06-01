import { Router } from "express";
import {
  getAllBatchesController,
  getSingleBatchController,
  getMyBatchController,
} from "../controllers/batchControllers.js";

import { requireSignIn } from "../middleware/authMiddleware.js";

const batchRoutes = Router();

/*
|--------------------------------------------------------------------------
| PUBLIC / ADMIN ROUTES
|--------------------------------------------------------------------------
*/

// Get all batches
batchRoutes.get("/all", getAllBatchesController);

// Get single batch with schedule
batchRoutes.get("/:id", getSingleBatchController);

/*
|--------------------------------------------------------------------------
| STUDENT ROUTES
|--------------------------------------------------------------------------
*/

// Get logged-in student's batch
batchRoutes.get("/student/my-batch", requireSignIn, getMyBatchController);

export default batchRoutes;
