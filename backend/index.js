// index.js (backend)
import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import Message from "./message.js";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Create HTTP server and attach Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL, // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'], // Allow both transports
  allowEIO3: true, // For compatibility
});

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    }
  });

  socket.on("send_message", async (data) => {
    const { senderId, receiverId, content } = data;
    
    if (!senderId || !receiverId || !content) {
      console.error("Missing required fields for message");
      return;
    }

    try {
      // Save message to database
      const newMessage = new Message({
        senderId,
        receiverId,
        content
      });
      await newMessage.save();

      // Emit to receiver
      io.to(receiverId).emit("receive_message", {
        ...data,
        _id: newMessage._id,
        createdAt: newMessage.createdAt
      });

      // Also send back to sender for confirmation
      socket.emit("message_sent", { 
        success: true, 
        messageId: newMessage._id 
      });

    } catch (err) {
      console.error("Error saving message:", err);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready at ws://localhost:${PORT}`);
});