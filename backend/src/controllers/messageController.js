import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import User from "../models/User.js";

// ─── 1. SEND A NEW MESSAGE ───
export const sendMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body; // Expecting the chat room ID and the text message

        if (!chatId || !content) {
            return res.status(400).json({ success: false, message: "Invalid data passed into request" });
        }

        // Create the structure for the new message
        let newMessage = {
            sender: req.user._id, // Logged-in user's ID from protect middleware
            content: content,
            chat: chatId,
        };

        // Save the message into the database
        let message = await Message.create(newMessage);

        // Populate details to return to the frontend
        message = await message.populate("sender", "username email");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "username email",
        });

        // Update the 'latestMessage' field in the Chat model so it shows on the sidebar
        await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

        return res.status(201).json({ success: true, message });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ─── 2. FETCH ALL MESSAGES FOR A SPECIFIC CHAT ───
export const allMessages = async (req, res) => {
    try {
        const { chatId } = req.params; // Get the chat ID from the URL parameter

        // Find all messages belonging to this chat ID
        const messages = await Message.find({ chat: chatId })
            .populate("sender", "username email")
            .populate("chat");

        return res.status(200).json({ success: true, messages });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};