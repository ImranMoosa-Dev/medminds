import express from "express";
import { getAllUsersController } from "../controllers/admin/userControllers.js";
// import { requireSignIn, isAdmin } from "../../middlewares/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.get("/all-users", getAllUsersController);

export default userRoutes;
