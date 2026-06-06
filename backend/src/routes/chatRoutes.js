import express from "express";
import { 
    accessChat, 
    fetchChats, 
    createGroupChat, 
    renameGroup, 
    addToGroup, 
    removeFromGroup 
} from "../controllers/chatController.js";
import { protect } from "../middlewares/authMiddleware.js"; // security guard check user is authorised or not 

const router = express.Router();

// ─── ONE-ON-ONE CHATS ───
router.post("/", protect, accessChat); // to open or create chat
router.get("/", protect, fetchChats);   // get all past chat details 

// ─── GROUP CHATS  ───
router.post("/group", protect, createGroupChat);       // To create a new group
router.put("/rename", protect, renameGroup);           // To rename an existing group
router.put("/groupadd", protect, addToGroup);         // To add someone to a group
router.put("/groupremove", protect, removeFromGroup);  // To remove someone or leave group

export default router;