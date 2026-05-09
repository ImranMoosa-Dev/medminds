import { Router } from "express";
import {
  signupController,
  loginController,
  forgotPasswordController,
} from "../controllers/authController.js";

const authRoutes = Router();

// Signup route
authRoutes.post("/signup", signupController);

//   Login route
authRoutes.post("/login", loginController);

// Forgot password route
authRoutes.post("/forgot-password", forgotPasswordController);
export default authRoutes;
