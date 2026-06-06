import Chat from "../models/Chat.js";
import User from "../models/User.js";

// ─── 1. ACCESS OR CREATE A ONE-ON-ONE CHAT ───
export const accessChat = async (req, res) => {
    try {
        const { userId } = req.body; // The ID of the user you want to chat with

        if (!userId) {
            return res.status(400).json({ success: false, message: "UserId param not sent with request" });
        }

        // Check if a chat already exists between the logged-in user and the target user
        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } }, // Contains the logged-in user ID
                { users: { $elemMatch: { $eq: userId } } },       // Contains the target user ID
            ],
        })
        .populate("users", "-password") // Fetch complete user details except their passwords
        .populate("latestMessage");     // Fetch the latest message details of this chat

        // Perform deep population to get the sender details inside the latest message
        isChat = await User.populate(isChat, {
            path: "latestMessage.sender",
            select: "username email",
        });

        // If the chat room already exists, return the existing chat
        if (isChat.length > 0) {
            return res.status(200).json({ success: true, chat: isChat[0] });
        } else {
            // If no chat exists, create a brand new chat room for both users
            const chatData = {
                chatName: "sender", // Default placeholder name for one-on-one chats
                isGroupChat: false,
                users: [req.user._id, userId], // Array containing both user IDs
            };

            const createdChat = await Chat.create(chatData);
            
            // Fetch the newly created chat with fully populated user details
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            return res.status(201).json({ success: true, chat: fullChat });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ─── 2. FETCH ALL CHATS FOR THE LOGGED-IN USER ───
export const fetchChats = async (req, res) => {
    try {
        // Find all chats where the logged-in user is a participant
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 }) // Sort from newest to oldest based on last activity
            .then(async (results) => {
                // Deep populate the sender details inside the latest message field
                results = await User.populate(results, {
                    path: "latestMessage.sender",
                    select: "username email",
                });
                return res.status(200).json({ success: true, chats: results });
            });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};