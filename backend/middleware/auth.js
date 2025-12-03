import jwt from "jsonwebtoken";
import User from "../user.js"; // Adjust path as needed

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded; // Contains { id, email, iat, exp }
    next();
  });
};

export const checkVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.verified) {
      return res.status(403).json({ 
        message: "Please verify your email first",
        needsVerification: true
      });
    }

    // Check if verification has expired (90 days)
    const now = new Date();
    if (user.verificationExpiresAt && user.verificationExpiresAt <= now) {
      return res.status(403).json({ 
        message: "Your verification has expired. Please verify again.",
        needsVerification: true
      });
    }

    req.userData = user; // Attach full user data if needed
    next();
  } catch (err) {
    console.error("Check verification error:", err);
    res.status(500).json({ message: "Server error checking verification" });
  }
};