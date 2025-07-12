import express from "express";
import { authenticateRequest } from "../middleware/authMiddleware.js";
import { searchPostController } from "../controllers/search-controllers.js";

const router = express.Router();

router.get("/posts", authenticateRequest, searchPostController);

export default router;
