// backend/testEmails.js
import dotenv from "dotenv";
dotenv.config(); // load .env variables

import { Resend } from "resend";

// Make sure the API key is loaded
if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing in your .env");
}

// Create Resend instance
const resend = new Resend(process.env.RESEND_API_KEY);

// Test function
async function sendTestEmail() {
  try {
    const response = await resend.emails.send({
      from: "sandbox@resend.dev",          // sandbox sender
      to: "tanvigarg.nj@gmail.com",       // replace with your UF email
      subject: "Test Email from Nook",
      html: "<p>This is a test email from Resend sandbox.</p>",
    });

    console.log("✅ Email sent successfully!");
    console.log(response);
  } catch (err) {
    console.error("❌ Failed to send email:");
    console.error(err);
  }
}

// Run the test
sendTestEmail();
