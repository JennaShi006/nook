// // backend/routes/auth.js
// import express from "express";
// import crypto from "crypto";
// import User from "./user.js";
// import { sendVerificationEmail } from "./emails.js";

// const router = express.Router();

// // SIGNUP route with email verification
// router.post("/signup", async (req, res) => {
//   try {
//     const { name, email, username, password, gradYear, gradMonth } = req.body;

//     // if (!email.endsWith("@ufl.edu")) {
//     //   return res.status(400).json({ message: "Must use a ufl.edu email" });
//     // }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "Email already registered" });

//     const verificationToken = crypto.randomBytes(32).toString("hex");

//     const newUser = new User({
//       name,
//       email,
//       username,
//       password, // hash later
//       gradYear,
//       gradMonth,
//       verified: false,
//       verificationToken,
//     });

//     await newUser.save();

//     // send email using the verified emails.js
//     await sendVerificationEmail(email, verificationToken);

//     res.status(200).json({ message: "Verification email sent!" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Signup failed" });
//   }
// });

// // VERIFY EMAIL route
// router.get("/verify/:token", async (req, res) => {
//   try {
//     const { token } = req.params;
//     const user = await User.findOne({ verificationToken: token });

//     if (!user) return res.status(400).json({ message: "Invalid or expired token" });

//     user.verified = true;
//     user.verificationToken = undefined;
//     await user.save();

//     res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Verification failed" });
//   }
// });

// export default router;
