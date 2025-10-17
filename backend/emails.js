// backend/utils/emails.js
import { Resend } from "resend";

// if (!process.env.RESEND_API_KEY) {
//   throw new Error("RESEND_API_KEY is missing in your .env");
// }

const resend = new Resend("re_184svZKZ_Cc9PohRzMqJwqfYh5MpRLySY");

export const sendVerificationEmail = async (email, token) => {
     console.log("Sending email to:", email);
  const verifyUrl = `${process.env.CLIENT_URL}/verify/${token}`;

  await resend.emails.send({
    from: "sandbox@resend.dev", // sandbox sender, works without a domain
    to: email,
    subject: "Verify your UF email",
    html: `
      <p>Welcome! Click below to verify your account:</p>
      <a href="${verifyUrl}" target="_blank">Verify Email</a>
    `,
  });
    console.log("Email sent!");
};
