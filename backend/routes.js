import express from "express";
import User from "./user.js";

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

export default router;