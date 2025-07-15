"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotificationNewRecommendation = exports.sendNotificationNewDocument = exports.sendPasswordResetEmail = exports.sendNewAccountNotification = exports.sendOtp = void 0;
const fs_1 = __importDefault(require("fs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = __importDefault(require("../config/env"));
const path_1 = __importDefault(require("path"));
const InternalError_1 = require("../errors/InternalError");
const mail = env_1.default.emailUser;
// Create a transporter object
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: mail,
        pass: env_1.default.emailPassword,
    },
});
/**
 * Send OTP to the user's email
 * @param email
 * @param otp
 * @returns boolean - true if the email is sent successfully, false otherwise
 */
const sendOtp = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read the email template
        const dir = path_1.default.resolve("./src/templates", "otpTemplate.html");
        const template = fs_1.default.readFileSync(dir, { encoding: "utf8", flag: "r" });
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
        const isSent = yield transporter.sendMail(mailOptions).then((res) => {
            if (res.accepted.length === 0)
                return false;
            return true;
        });
        return isSent;
    }
    catch (error) {
        console.error(error);
        throw new InternalError_1.InternalServerError("otp_send_failed");
    }
});
exports.sendOtp = sendOtp;
const sendNewAccountNotification = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read the email template
        const dir = path_1.default.resolve("./src/templates", "accountCreated.html");
        const template = fs_1.default.readFileSync(dir, { encoding: "utf8", flag: "r" });
        // Replace the placeholder with the OTP
        const html = template.replace("{{password}}", password);
        // Email options
        const mailOptions = {
            from: mail,
            to: email,
            subject: "Insight Paper: New account created",
            html,
        };
        const isSent = yield transporter.sendMail(mailOptions).then((res) => {
            if (res.accepted.length === 0)
                return false;
            return true;
        });
        return isSent;
    }
    catch (error) {
        console.error(error);
        throw new InternalError_1.InternalServerError("account_creation_notification_failed");
    }
});
exports.sendNewAccountNotification = sendNewAccountNotification;
/**
 * Sends the user a password reset email
 * @param email The user's email
 * @param token The password reset token
 * @returns boolean - true if the email is sent successfully, false otherwise
 */
const sendPasswordResetEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read the email template
        const dir = path_1.default.resolve("./src/templates", "passwordReset.html");
        const template = fs_1.default.readFileSync(dir, { encoding: "utf8", flag: "r" });
        const link = `${env_1.default.clientBaseUrl}/reset-password?token=${token}`;
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
        const isSent = yield transporter.sendMail(mailOptions).then((res) => {
            if (res.accepted.length === 0)
                return false;
            return true;
        });
        return isSent;
    }
    catch (error) {
        console.error(error);
        throw new InternalError_1.InternalServerError("password_reset_email_failed");
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
/**
 * Send Notification to the user's email
 * @param email
 * @param courseName
 * @returns boolean - true if the email is sent successfully, false otherwise
 */
const sendNotificationNewDocument = (email, courseName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read the email template
        const dir = path_1.default.resolve("./src/templates", "notificationDocumentTemplate.html");
        const template = fs_1.default.readFileSync(dir, { encoding: "utf8", flag: "r" });
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
        const isSent = yield transporter.sendMail(mailOptions).then((res) => {
            if (res.accepted.length === 0)
                return false;
            return true;
        });
        return isSent;
    }
    catch (error) {
        console.error(error);
        throw new InternalError_1.InternalServerError("notification_send_failed");
    }
});
exports.sendNotificationNewDocument = sendNotificationNewDocument;
/**
 * Send Notification to the user's email
 * @param email
 * @param courseName
 * @returns boolean - true if the email is sent successfully, false otherwise
 */
const sendNotificationNewRecommendation = (email, courseName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Read the email template
        const dir = path_1.default.resolve("./src/templates", "notificationRecommendationTemplate.html");
        const template = fs_1.default.readFileSync(dir, { encoding: "utf8", flag: "r" });
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
        const isSent = yield transporter.sendMail(mailOptions).then((res) => {
            if (res.accepted.length === 0)
                return false;
            return true;
        });
        return isSent;
    }
    catch (error) {
        console.error(error);
        throw new InternalError_1.InternalServerError("notification_send_failed");
    }
});
exports.sendNotificationNewRecommendation = sendNotificationNewRecommendation;
