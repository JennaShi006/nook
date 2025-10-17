import express from "express";
import User from "./user.js";
import Message from "./message.js";
import mongoose from "mongoose";

const router = express.Router();

// POST /api/users
router.post("/users", async (req, res) => {
  try {
    const { name, email, username, password, gradYear, gradMonth } = req.body;

    const newUser = new User({ name, email, username, password, gradYear, gradMonth });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { name, email, username, password, gradYear, gradMonth } = req.body;
    const newUser = new User({ name, email, username, password, gradYear, gradMonth });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/users/:id  -> get a single user by their ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user info
router.put("/users/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get all messages between two users
router.get("/messages/:userA/:userB", async (req, res) => {
  try {
    const { userA, userB } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    }).sort({ createdAt: 1 }); // oldest -> newest

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all unique chat partners for a user
router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const objectId = new mongoose.Types.ObjectId(userId);

    const messages = await Message.find({
      $or: [{ senderId: objectId }, { receiverId: objectId }],
    });

    // collects all unique partner IDs
    const partnerIds = new Set();
    messages.forEach((msg) => {
      if (msg.senderId.toString() !== userId)
        partnerIds.add(msg.senderId.toString());
      if (msg.receiverId.toString() !== userId)
        partnerIds.add(msg.receiverId.toString());
    });

    // fetch those users
    const partners = await User.find({ _id: { $in: Array.from(partnerIds) } })
      .select("_id name username email");

    res.status(200).json(partners);
  } catch (err) {
    console.error("Error loading conversations:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;