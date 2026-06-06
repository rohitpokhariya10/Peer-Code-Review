import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatName: { 
      type: String, 
      trim: true 
    },
    isGroupChat: { 
      type: Boolean, 
      default: false 
    },
    users: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" // Users array will always linked to user model
      }
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message", // to show last message on chat app
    },
    groupAdmin: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" // to set group chat admin
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;