import fs from "fs";
import nodemailer from "nodemailer";
import envConfig from "../config/env";
import path from "path";
import { InternalServerError } from "../errors/InternalError";
const mail = envConfig.emailUser;

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: mail,
    pass: envConfig.emailPassword,
  },
});

/**
 * Send OTP to the user's email
 * @param email
 * @param otp
 * @returns boolean - true if the email is sent successfully, false otherwise
 */
export const sendOtp = async (email: string, otp: string): Promise<boolean> => {
  try {
    // Read the email template
    const dir = path.resolve("./src/templates", "otpTemplate.html");
    const template = fs.readFileSync(dir, { encoding: "utf8", flag: "r" });
    // Replace the placeholder with the OTP
    const html = template.replace("{{otp}}", otp);

    // Email options
    const mailOptions = {
      from: mail,
      to: email,
      subject: "InsightPaper: OTP for email verification",
      html,
    };

    // Send the email
    const isSent = await transporter.sendMail(mailOptions).then((res) => {
      if (res.accepted.length === 0) return false;

      return true;
    });

    return isSent;
  } catch (error) {
    console.error(error);
    throw new InternalServerError("otp_send_failed");
  }
};

export const sendNewAccountNotification = async (
  email: string,
  password: string
): Promise<boolean> => {
  try {
    // Read the email template
    const dir = path.resolve("./src/templates", "accountCreated.html");
    const template = fs.readFileSync(dir, { encoding: "utf8", flag: "r" });

    // Replace the placeholder with the OTP
    const html = template.replace("{{password}}", password);

    // Email options
    const mailOptions = {
      from: mail,
      to: email,
      subject: "Insight Paper: New account created",
      html,
    };

    const isSent = await transporter.sendMail(mailOptions).then((res) => {
      if (res.accepted.length === 0) return false;

      return true;
    });

    return isSent;
  } catch (error) {
    console.error(error);
    throw new InternalServerError("account_creation_notification_failed");
  }
};

/**
 * Sends the user a password reset email
 * @param email The user's email
 * @param token The password reset token
 * @returns boolean - true if the email is sent successfully, false otherwise
 */
export const sendPasswordResetEmail = async (
  email: string,
  token: string
): Promise<boolean> => {
  try {
    // Read the email template
    const dir = path.resolve("./src/templates", "passwordReset.html");
    const template = fs.readFileSync(dir, { encoding: "utf8", flag: "r" });

    const link = `${envConfig.clientBaseUrl}/reset-password?token=${token}`;
    // Replace the placeholder with the link
    const html = template.replace("{{link}}", link);

    // Email options
    const mailOptions = {
      from: mail,
      to: email,
      subject: "Insight Paper: Reset your password",
      html,
    };

    // Send the email
    const isSent = await transporter.sendMail(mailOptions).then((res) => {
      if (res.accepted.length === 0) return false;

      return true;
    });

    return isSent;
  } catch (error) {
    console.error(error);
    throw new InternalServerError("password_reset_email_failed");
  }
};

/**
 * Send Notification to the user's email
 * @param email
 * @param courseName
 * @returns boolean - true if the email is sent successfully, false otherwise
 */
export const sendNotificationNewDocument = async (
  email: string,
  courseName: string
): Promise<boolean> => {
  try {
    // Read the email template
    const dir = path.resolve(
      "./src/templates",
      "notificationDocumentTemplate.html"
    );
    const template = fs.readFileSync(dir, { encoding: "utf8", flag: "r" });
    // Replace the placeholder with the courseName
    const html = template.replace("{{courseName}}", courseName);

    // Email options
    const mailOptions = {
      from: mail,
      to: email,
      subject: "InsightPaper: New Document Notification",
      html,
    };

    // Send the email
    const isSent = await transporter.sendMail(mailOptions).then((res) => {
      if (res.accepted.length === 0) return false;

      return true;
    });

    return isSent;
  } catch (error) {
    console.error(error);
    throw new InternalServerError("notification_send_failed");
  }
};

/**
 * Send Notification to the user's email
 * @param email
 * @param courseName
 * @returns boolean - true if the email is sent successfully, false otherwise
 */
export const sendNotificationNewRecommendation = async (
  email: string,
  courseName: string
): Promise<boolean> => {
  try {
    // Read the email template
    const dir = path.resolve(
      "./src/templates",
      "notificationRecommendationTemplate.html"
    );
    const template = fs.readFileSync(dir, { encoding: "utf8", flag: "r" });
    // Replace the placeholder with the courseName
    const html = template.replace("{{courseName}}", courseName);

    // Email options
    const mailOptions = {
      from: mail,
      to: email,
      subject: "InsightPaper: New Document Notification",
      html,
    };

    // Send the email
    const isSent = await transporter.sendMail(mailOptions).then((res) => {
      if (res.accepted.length === 0) return false;

      return true;
    });

    return isSent;
  } catch (error) {
    console.error(error);
    throw new InternalServerError("notification_send_failed");
  }
};
