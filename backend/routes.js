import express from "express";
import User from "./user.js";
import Listing from "./listing.js";

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

export default router;