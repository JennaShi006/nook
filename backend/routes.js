import express from "express";
import User from "./user.js";
import Listing from "./listing.js";
import crypto from "crypto";
import Message from "./message.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import multer from "multer";
import FormData from "form-data";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "./emails.js";
import Review from "./reviews.js"; 
import { requireAuth, checkVerification } from "./middleware/auth.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
}); //used to store images in memory for file upload


router.post("/signup", async (req, res) => {
  try {
    const { name, email, username, password, gradYear, gradMonth, userType, adminCode } = req.body;

    // Restrict to ufl.edu emails
    if (!email.endsWith("@ufl.edu")) {
      return res.status(400).json({ message: "Must use a ufl.edu email" });
    }
    
    if (!password || password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    if (!userType || !["buyer", "seller", "admin"].includes(userType)) {
      return res.status(400).json({ message: "Invalid userType" });
    }

    // If requesting admin role, validate admin code server-side
    if (userType === "admin") {
      const serverAdminCode = process.env.ADMIN_CODE;
      if (!serverAdminCode) {
        console.warn("ADMIN_CODE not configured in environment; rejecting admin signups");
        return res.status(403).json({ message: "Admin signups are disabled" });
      }
      if (!adminCode || adminCode !== serverAdminCode) {
        return res.status(403).json({ message: "Invalid admin code" });
      }
    }

    // Keep the better uniqueness check from HEAD (your original code)
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(400).json({ 
        message: `${field} already registered` 
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    
    // Set verification expiry to 90 days from now
    const verificationExpiresAt = new Date();
    verificationExpiresAt.setDate(verificationExpiresAt.getDate() + 90);
    
    const newUser = new User({
      name,
      email,
      username,
      password,
      gradYear,
      gradMonth,
      userType,
      verified: false,
      verificationToken,
      verificationExpiresAt, // Set initial expiry
    });

    await newUser.save();

    await sendVerificationEmail(newUser.email, verificationToken, newUser._id);

    res.status(200).json({ // added user info in response to allow for frontend to actually access user.id
      message: "Verification email sent!",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        gradMonth: newUser.gradMonth,
        gradYear: newUser.gradYear,
        userType: newUser.userType,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ 
      message: "Signup failed. Please try again." 
    });
  }
});

//////////////////////////
// VERIFY EMAIL
//////////////////////////
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    // Mark as verified and update verification expiry
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationExpiresAt = new Date();
    user.verificationExpiresAt.setDate(user.verificationExpiresAt.getDate() + 90);
    await user.save();
    
    // Generate JWT token
    const payload = { id: user._id, email: user.email };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: "90d" 
    });
    
    // Redirect to account settings with token
    const redirectUrl = `${process.env.CLIENT_URL}/account?userId=${user._id}&token=${jwtToken}`;
    res.redirect(redirectUrl);

  } catch (err) {
    console.error("Error in /verify/:token:", err);
    res.status(500).json({ message: "Verification failed" });
  }
});

// Protected route that requires authentication AND verification
router.get("/api/protected/profile", requireAuth, checkVerification, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route that only requires authentication (not verification)
router.get("/api/some-data", requireAuth, async (req, res) => {
  // This route is accessible even if not verified
  res.json({ data: "Some data" });
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
    const { name, email, username, password, gradYear, gradMonth, userType} = req.body;
    const newUser = new User({ name, email, username, password, gradYear, gradMonth, userType});
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

// search all listings
router.get("/listings", async (req, res) => {
  try {
    const { search, minPrice, maxPrice, startDate, endDate } = req.query;
    const query = {};

    //text search on title and description:
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    // price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    // date range filter
    if (startDate || endDate) {
      query.datePosted = {};
      if (startDate) query.datePosted.$gte = new Date(startDate);
      if (endDate) query.datePosted.$lte = new Date(endDate);
    }
    const listings = await Listing.find(query).sort({ datePosted: -1 });
    res.status(200).json(listings);
  } catch (err) {
    console.error("Error in /listings:", err);
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

router.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const formData = new FormData();
    formData.append("key", process.env.IMGBB_API_KEY);
    formData.append("image", req.file.buffer, {
      filename: req.file.originalname, 
      contentType: req.file.mimetype,
    });
    const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });
    
    const result = await imgbbRes.json();

    if (!result.success) {
      return res.status(500).json({error: "Image upload failed", details: result });
    }

    const imageURL = result.data.url;
    res.status(200).json({ url: imageURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload image" });
  }

});

// login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // If user doesn't have userType, set a default
    if (!user.userType) {
      user.userType = "buyer";
      await user.save();
      console.log("Added default userType to existing user:", user.email);
    }

    let passwordValid;
    
    // Check if password is hashed (bcrypt hashes start with $2b$)
    if (user.password && user.password.startsWith('$2b$')) {
      // Compare using bcrypt (from the merge)
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // Use plain text comparison (your original code)
      passwordValid = user.password === password;
    }
    
    if (!passwordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is verified
    if (!user.verified) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      user.verificationToken = verificationToken;
      await user.save();
      
      await sendVerificationEmail(user.email, verificationToken, user._id);
      
      return res.status(400).json({ 
        message: "Please verify your email first. A new verification link has been sent.",
        needsVerification: true
      });
    }

    // Check if verification has expired (90 days)
    const now = new Date();
    if (user.verificationExpiresAt && user.verificationExpiresAt <= now) {
      const verificationToken = crypto.randomBytes(32).toString("hex");
      user.verified = false;
      user.verificationToken = verificationToken;
      await user.save();
      
      await sendVerificationEmail(user.email, verificationToken, user._id);
      
      return res.status(400).json({ 
        message: "Your session has expired. Please verify your email again.",
        needsVerification: true
      });
    }

    // Update last login and verification expiry
    user.lastLoginAt = new Date();
    user.verificationExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
    await user.save();

    // Generate JWT token
    const payload = { 
      id: user._id, 
      email: user.email 
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: "90d"
    });

    res.status(200).json({
      message: "Login successful!",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        gradMonth: user.gradMonth,
        gradYear: user.gradYear,
        verified: user.verified,
        verificationExpiresAt: user.verificationExpiresAt
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Add this route temporarily to fix all users
router.get("/fix-usertypes", async (req, res) => {
  try {
    const users = await User.find({ userType: { $exists: false } });
    
    console.log(`Found ${users.length} users without userType`);
    
    for (const user of users) {
      user.userType = "buyer";
      await user.save();
      console.log(`Fixed user: ${user.email}`);
    }
    
    res.json({ 
      message: `Added userType to ${users.length} users`,
      fixedCount: users.length 
    });
  } catch (err) {
    console.error("Fix error:", err);
    res.status(500).json({ error: "Failed to fix userTypes" });
  }
});

// Resend verification email endpoint
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken, user._id);

    res.status(200).json({ 
      message: "Verification email sent! Please check your inbox." 
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ message: "Failed to resend verification email" });
  }
});

// Fallback endpoint for sending a message (without socket)
router.post("/messages/send", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newMessage = new Message({
      senderId: req.body.senderId,
      receiverId: req.body.receiverId,
      content: req.body.content,
    });
    await newMessage.save();

    res.status(201).json({ message: "Message stored successfully", newMessage });
  } catch (err) {
    console.error("Error in /messages/send:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

//reviews routes
router.get("/reviews/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;

    const reviews = await Review.find({ listing: listingId })
      .populate("reviewer", "name username");

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ reviews, avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

router.post("/reviews/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const { reviewerId, rating, comment } = req.body;

    if (!reviewerId || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const newReview = new Review({
      reviewer: reviewerId,
      seller: listing.seller,
      listing: listingId,
      rating,
      comment,
    });

    await newReview.save();

    const listingReviews = await Review.find({ listing: listingId });
    const listingAvg =
      listingReviews.reduce((sum, r) => sum + r.rating, 0) /
      listingReviews.length;

    listing.avgRating = listingAvg;
    listing.numReviews = listingReviews.length;
    await listing.save();

    const sellerReviews = await Review.find({ seller: listing.seller });
    const sellerAvg =
      sellerReviews.reduce((sum, r) => sum + r.rating, 0) /
      sellerReviews.length;

    const sellerUser = await User.findById(listing.seller);
    sellerUser.sellerAvgRating = sellerAvg;
    sellerUser.sellerNumReviews = sellerReviews.length;
    await sellerUser.save();

    const populatedReview = await Review.findById(newReview._id)
      .populate("reviewer", "name username");

    res.status(201).json({
      review: populatedReview,
      listingAvgRating: listing.avgRating,
      listingNumReviews: listing.numReviews,
      sellerAvgRating: sellerUser.sellerAvgRating,
      sellerNumReviews: sellerUser.sellerNumReviews,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add review" });
  }
});

// GET /api/reviews/seller/:sellerId
router.get("/reviews/seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;

    const reviews = await Review.find({ seller: sellerId })
      .populate("reviewer", "name username");

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({ reviews, avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});


export default router;