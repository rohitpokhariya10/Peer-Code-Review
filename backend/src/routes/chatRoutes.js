import express from "express";
import { accessChat, fetchChats } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js"; // security guard check user is authorised or not 

const router = express.Router();

// Add both the routes to protect middleware 
router.post("/", protect, accessChat); // to open or create chat
router.get("/", protect, fetchChats);   // get all past chat details 

export default router;