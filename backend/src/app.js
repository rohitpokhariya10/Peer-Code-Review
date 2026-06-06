import express from "express";
import cors from "cors"; 
import cookieParser from "cookie-parser";
import authRoutes from './routes/authRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import messageRoutes from './routes/messageRoutes.js'

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // for cookies read/write

// Routes Links
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes); 

export default app;