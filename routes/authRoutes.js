import { Router } from "express";
import { requireSignIn } from "../middleware/authMiddleware.js";
import {
  signupController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  verifyEmailController,
} from "../controllers/authControllers.js";

const authRoutes = Router();

// REGISTER ROUTE
authRoutes.post("/register", signupController);

// LOGIN ROUTE
authRoutes.post("/login", loginController);

// FORGOT PASSWORD ROUTE
authRoutes.post("/forgot-password", forgotPasswordController);

// RESET PASSWORD ROUTE
authRoutes.post("/reset-password", resetPasswordController);

// EMAIL VERIFICATION ROUTE FOR STUDENTS
authRoutes.get("/verify-email/:token", verifyEmailController);

// PROTECTED ROUTE FOR STUDENTS
authRoutes.get("/me", requireSignIn, (req, res) => {
  return res
    .status(200)
    .send({ ok: true, message: "This is a protected route for students." });
});

export default authRoutes;
