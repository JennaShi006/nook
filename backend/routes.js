import express from "express";
import User from "./user.js";
import Listing from "./listing.js";
import crypto from "crypto";
import { sendVerificationEmail } from "./emails.js";
import Message from "./message.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";



const router = express.Router();
router.post("/signup", async (req, res) => {
  try {
    const { name, email, username, password, gradYear, gradMonth } = req.body;

    // restrict to ufl.edu emails
    // if (!email.endsWith("@ufl.edu")) {
    //   return res.status(400).json({ message: "Must use a ufl.edu email" });
    // }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      name,
      email,
      username,
      password, // hash later
      gradYear,
      gradMonth,
      verified: false,
      verificationToken,
    });

    await newUser.save();

    // send email using your emails.js
    await sendVerificationEmail(newUser.email, verificationToken, newUser._id);

    res.status(200).json({ message: "Verification email sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

//////////////////////////
// VERIFY EMAIL
//////////////////////////
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    const payload = { id: user._id, email: user.email };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    const redirectUrl = `${process.env.CLIENT_URL}/account?userId=${user._id}&token=${jwtToken}`;
    res.redirect(redirectUrl);

  } catch (err) {
    console.error("Error in /verify/:token:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

// POST /api/users
// router.post("/users", async (req, res) => {
//   try {
//     const { name, email, username, password, gradYear, gradMonth } = req.body;

//     const newUser = new User({ name, email, username, password, gradYear, gradMonth });
//     await newUser.save();

//     res.status(201).json(newUser);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

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
// const mongoose = require("mongoose");

router.get("/users/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);

  } 
  catch (err) {
    console.error("Error in /users/:id:", err);
    res.status(500).json({ error: "Server error" });
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

// add a listing
router.post("/listings", async (req, res) => {
  try {
    const { title, description, price, picture, seller } = req.body;
    const newListing = new Listing({ title, description, price, picture, seller });
    const savedListing = await newListing.save();
    res.status(201).json(savedListing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// get all listings
router.get("/listings", async (req, res) => {
  try {
    // Use mongoose query sorting. Previously .toSorted was passed an object
    // which caused the error "The comparison function must be either a function or undefined"
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
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