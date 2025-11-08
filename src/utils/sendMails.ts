import * as SibApiV3Sdk from "@sendinblue/client";

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

if (process.env.SENDINBLUE_API_KEY) {
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.SENDINBLUE_API_KEY
  );
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
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

    if (error.response && error.response.text) {
      console.error("Brevo API Response Error:", error.response.text);
    }
    throw new Error("Email not sent");
  }
};
