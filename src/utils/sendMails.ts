import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      // Brevo's dedicated SMTP Host
      host: "smtp-relay.brevo.com",
      // Standard secure port for Brevo (587 uses STARTTLS)
      port: 587,
      secure: false, // Must be false for port 587
      requireTLS: true,
      auth: {
        // Brevo uses your verified sender email (EMAIL_SENDER) as the username
        user: process.env.EMAIL_SENDER,
        // Brevo uses the API Key (SENDINBLUE_API_KEY) as the password
        pass: process.env.SENDINBLUE_API_KEY,
      },
    });

    const mailOptions = {
      from: `"App Tracker" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email not sent");
  }
};
