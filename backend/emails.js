import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email,  token,userId) {
  // const verifyUrl = `${process.env.CLIENT_URL}/account?userId=${userId}&token=${token}`;
  const verifyUrl = `${process.env.BACKEND_URL}/api/verify/${token}`;


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
