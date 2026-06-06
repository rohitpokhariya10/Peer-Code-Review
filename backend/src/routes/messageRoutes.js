import express from "express";
import { sendMessage, allMessages } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js"; // Security guard middleware

const router = express.Router();

// Apply security middleware to both endpoints
router.post("/", protect, sendMessage);        // Route to send a message
router.get("/:chatId", protect, allMessages);  // Route to get all messages for a specific room

export default router;