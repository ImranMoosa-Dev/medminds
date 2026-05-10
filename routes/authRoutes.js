import { Router } from "express";
import {
  signupController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authControllers.js";

const authRoutes = Router();

// Signup route
authRoutes.post("/register", signupController);

// Login route
authRoutes.post("/login", loginController);

// Forgot password route
authRoutes.post("/forgot-password", forgotPasswordController);

// Reset password route
authRoutes.post("/reset-password", resetPasswordController);
export default authRoutes;
