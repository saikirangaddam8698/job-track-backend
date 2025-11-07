// src/utils/sendMail.ts

import * as SibApiV3Sdk from "@sendinblue/client";

// Initialize the API Client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set the API key
if (process.env.SENDINBLUE_API_KEY) {
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.SENDINBLUE_API_KEY
  );
}

/**
 * Sends a transactional email using the Brevo HTTP API (Port 443).
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    // Check for API key existence before proceeding (good practice)
    if (!process.env.SENDINBLUE_API_KEY) {
      throw new Error("Missing Brevo API Key. Cannot send email.");
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Set the email content using the API object model
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_SENDER!, // Assumes EMAIL_SENDER is set
      name: "App Tracker",
    };

    // Set recipient and content details
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;

    // Execute the API call
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(
      "Email sent successfully via Brevo HTTP API. Returned data:",
      data
    );
  } catch (error: any) {
    console.error("Error sending email via Brevo API:", error);

    // Log specific API error response text for debugging
    if (error.response && error.response.text) {
      console.error("Brevo API Response Error:", error.response.text);
    }
    throw new Error("Email not sent");
  }
};
