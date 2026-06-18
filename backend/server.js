import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDb from "./src/config/database.js";

const port = process.env.PORT || 3000;

// Connect to Database
connectDb();

// 2. HTTP Server create karo express app ko use karke
const server = http.createServer(app);

// 3. Socket.io Initialization
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// 4. Socket Connection Logic (Sheryians Flow)
io.on("connection", (socket) => {
  console.log(" Connected to socket.io successfully!");

  // User joins their personal room
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(`👤 User joined personal room: ${userData._id}`);
    socket.emit("connected");
  });

  // User enters a specific chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(` User entered Chat Room: ${room}`);
  });

  // Real-time message transfer
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      const userId = typeof user === "object" ? user._id : user;
      if (userId == newMessageReceived.sender._id) return;

      socket.in(userId).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED");
  });
});

// Start the HTTP server so both Express routes and Socket.io events work.
server.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
