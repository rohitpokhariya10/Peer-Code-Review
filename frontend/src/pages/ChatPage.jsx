import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000"; 
var socket;

const ChatPage = () => {
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  
  const navigate = useNavigate();

  // ─── 1. FETCH ALL USER'S CHATS ───
  const fetchUserChats = async () => {
    if (!user) return;
    try {
      const config = { withCredentials: true };
      const { data } = await axios.get(`${ENDPOINT}/api/chat`, config);
      setChats(data.chats || data);
    } catch (error) {
      console.log("Chats fetch karne mein error!", error);
    }
  };

  // ─── 2. FETCH MESSAGES FOR SELECTED CHAT ───
  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = { withCredentials: true };
      const { data } = await axios.get(`${ENDPOINT}/api/message/${selectedChat._id}`, config);
      setMessages(data.messages || data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log("Messages load nahi ho paye bhai!");
    }
  };

  // ─── 3. SEND MESSAGE ───
  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      try {
        const config = {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        };
        setNewMessage(""); 
        const { data } = await axios.post(
          `${ENDPOINT}/api/message`,
          { content: newMessage, chatId: selectedChat._id },
          config
        );
        socket.emit("new message", data.message || data);
        setMessages([...messages, data.message || data]);
      } catch (error) {
        console.log("Message send karne mein lafda hua!");
      }
    }
  };

  useEffect(() => {
    if (user) {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on("message received", (newMessageReceived) => {
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          alert(`Naya message aaya hai from ${newMessageReceived.sender.username}!`);
        } else {
          setMessages([...messages, newMessageReceived]);
        }
      });
    }
    return () => {
      if (socket) socket.off("message received");
    };
  }, [messages, selectedChat]);

  useEffect(() => {
    fetchUserChats();
  }, [user, selectedChat]);

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 font-sans text-slate-800">
      {/* ─── NAVBAR / HEADER ─── */}
      <header className="flex h-16 w-full items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm z-10">
        <h2 className="text-lg md:text-xl font-bold tracking-wide text-slate-800">🗣️ BaatCheet</h2>
        <div className="flex items-center gap-3 md:gap-4">
          <span className="text-xs md:text-sm font-medium bg-slate-100 px-3 py-1.5 rounded-full max-w-[120px] md:max-w-none truncate">
            👤 {user?.username}
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("userInfo");
              navigate("/");
            }}
            className="text-xs md:text-sm font-semibold text-red-500 hover:text-red-600 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ─── MAIN CHAT INTERFACE ─── */}
      <main className="flex flex-1 overflow-hidden p-2 md:p-4 gap-4 relative">
        
        {/* LEFT PANEL: CHATS LIST (Mobile par tabhi dikhega jab koi chat selected nahi hai) */}
        <section className={`w-full md:w-1/3 flex flex-col rounded-xl border bg-white p-4 shadow-sm h-full ${
          selectedChat ? "hidden md:flex" : "flex"
        }`}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">My Chats</h3>
            <button className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 transition">
              + New Group
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {chats && chats.length > 0 ? (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  className={`cursor-pointer rounded-lg p-3 transition-all ${
                    selectedChat?._id === chat._id
                      ? "bg-slate-800 text-white shadow-md"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <p className="font-semibold">
                    {chat.isGroupChat ? chat.chatName : chat.users?.find((u) => u._id !== user?._id)?.username || "Chat"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-slate-400 mt-10">Koi chat nahi hai bhai.</p>
            )}
          </div>
        </section>

        {/* RIGHT PANEL: CHAT WINDOW (Mobile par tabhi dikhega jab chat click ho chuki ho) */}
        <section className={`w-full md:flex-1 flex flex-col rounded-xl border bg-white shadow-sm overflow-hidden h-full ${
          !selectedChat ? "hidden md:flex" : "flex"
        }`}>
          {selectedChat ? (
            <div className="flex flex-1 flex-col h-full">
              {/* Active Chat Header */}
              <div className="border-b bg-slate-50 p-4 font-bold text-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {/* MOBILE BACK BUTTON (←) */}
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="flex md:hidden text-xl font-bold bg-slate-200 hover:bg-slate-300 px-2.5 py-1 rounded-lg text-slate-800 transition"
                  >
                    ←
                  </button>
                  <span className="text-sm md:text-base">
                    {selectedChat.isGroupChat 
                      ? `👥 ${selectedChat.chatName}` 
                      : `👤 ${selectedChat.users?.find((u) => u._id !== user?._id)?.username}`}
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-100">
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={`flex flex-col max-w-[85%] md:max-w-[70%] rounded-xl p-3 shadow-xs ${
                      m.sender._id === user?._id
                        ? "ml-auto bg-slate-800 text-white rounded-br-none"
                        : "mr-auto bg-white text-slate-800 rounded-bl-none"
                    }`}
                  >
                    {selectedChat.isGroupChat && m.sender._id !== user?._id && (
                      <span className="text-[10px] font-bold text-slate-400 mb-0.5">{m.sender.username}</span>
                    )}
                    <p className="text-sm">{m.content}</p>
                  </div>
                ))}
              </div>

              {/* Message Input Box */}
              <div className="p-3 border-t bg-white">
                <input
                  type="text"
                  placeholder="Type a message and hit Enter..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={sendMessage}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white transition"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-slate-400 p-4">
              <span className="text-4xl mb-2">💬</span>
              <p className="text-sm text-center">Kisi chat par click karo baat shuru karne ke liye!</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default ChatPage;