import { Router } from "express";
import { requireSignIn } from "../middleware/authMiddleware.js";
import { getLeaderboardInfoController } from "../controllers/leaderboardControllers.js";

const leaderboardRoutes = Router();

// get single quiz attempts by attempt id
leaderboardRoutes.get("/", requireSignIn, getLeaderboardInfoController);
export default leaderboardRoutes;
