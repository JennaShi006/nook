import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
import { Server } from "socket.io";
import Message from "./message.js";


dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
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
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });

  socket.on("send_message", async (data) => {
    const { senderId, receiverId, content } = data;
    const newMessage = new Message({ senderId, receiverId, content });
    await newMessage.save();

    if (!senderId || !receiverId) {
      console.error("Missing senderId or receiverId");
      return;
    }

    // Send to receiver’s room only
    io.to(receiverId).emit("receive_message", newMessage);
    // Also send back to sender so they see their own sent message instantly
    io.to(senderId).emit("receive_message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));