import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

console.log("Loaded creds:", process.env.EMAIL_USER, process.env.EMAIL_PASS ? "PASS FOUND" : "NO PASS");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email,  token,userId) {
  // Use the userId that’s passed in
  const verifyUrl = `${process.env.CLIENT_URL}/account?userId=${userId}&token=${token}`;

  const mailOptions = {
    from: `"Nook" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Verify Your Email</h2>
        <p>Click the link below to verify your account:</p>
        <a href="${verifyUrl}" 
          style="border: bold; border-color: black; background-color: #a3d8ff; color:white;padding:10px 20px;text-decoration:none;border-radius:4px;">
          Verify Email
        </a>
        <p>If you didn’t create an account, please ignore this message.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(" Verification email sent to", email);
  } catch (err) {
    console.error(" Email send error:", err);
  }
}
