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

// ─── 3. CREATE A NEW GROUP CHAT ───
export const createGroupChat = async (req, res) => {
    try {
        if (!req.body.users || !req.body.name) {
            return res.status(400).json({ success: false, message: "Please fill all the fields" });
        }

        // Frontend se users array stringify ho kar aata hai, use parse karenge
        var users = JSON.parse(req.body.users);

        if (users.length < 2) {
            return res.status(400).json({ success: false, message: "More than 2 users are required to form a group chat" });
        }

        // Logged-in user ko bhi group mein add karo
        users.push(req.user._id);

        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user._id,
        });

        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        return res.status(200).json({ success: true, chat: fullGroupChat });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ─── 4. RENAME AN EXISTING GROUP ───
export const renameGroup = async (req, res) => {
    try {
        const { chatId, chatName } = req.body;

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { chatName: chatName },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        if (!updatedChat) {
            return res.status(404).json({ success: false, message: "Chat Not Found" });
        }
        
        return res.status(200).json({ success: true, chat: updatedChat });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ─── 5. ADD A USER TO AN EXISTING GROUP ───
export const addToGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const added = await Chat.findByIdAndUpdate(
            chatId,
            { $push: { users: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        if (!added) {
            return res.status(404).json({ success: false, message: "Chat Not Found" });
        }
        
        return res.status(200).json({ success: true, chat: added });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ─── 6. REMOVE A USER FROM A GROUP ───
export const removeFromGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;

        const removed = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        if (!removed) {
            return res.status(404).json({ success: false, message: "Chat Not Found" });
        }
        
        return res.status(200).json({ success: true, chat: removed });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};