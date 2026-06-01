import { Router } from "express";
import { requireSignIn } from "../middleware/authMiddleware.js";
import {
  deleteAccountController,
  getProfileController,
  updateProfileController,
} from "../controllers/studentControllers.js";

const studentRoutes = Router();

// get user profile
studentRoutes.get("/profile", requireSignIn, getProfileController);

// update user profile
studentRoutes.put("/update-profile", requireSignIn, updateProfileController);

// Delete Student Account
studentRoutes.delete("/delete-account", requireSignIn, deleteAccountController);

export default studentRoutes;
