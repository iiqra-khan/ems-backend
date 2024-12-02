import generateContent from "../controllers/genModelController.js";
import express from "express";
import authenticateJWT from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/", authenticateJWT, generateContent);

export default router;

