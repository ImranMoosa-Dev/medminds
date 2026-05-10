import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Protected Routes token-based
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "No token provided or token format is invalid",
      });
    }

    const token = authHeader.split(" ")[1];
    const decode = JWT.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decode;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).send({
      success: false,
      message: "Token expired or invalid",
      expired: error?.name === "TokenExpiredError",
    });
  }
};

// Admin access
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.error("Admin Middleware Error:", error.message);
    res.status(401).send({
      success: false,
      message: "Error in Admin Middleware",
      error: error.message,
    });
  }
};
