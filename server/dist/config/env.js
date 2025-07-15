"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const envConfig = {
    port: parseInt(process.env.PORT || "5000"),
    llmServerUrl: process.env.LLM_SERVER_URL || "http://localhost:4000",
    clientBaseUrl: process.env.CLIENT_BASE_URL || "",
    databaseUser: process.env.DATABASE_USER || "",
    databasePassword: process.env.DATABASE_PASSWORD || "",
    databaseServer: process.env.DATABASE_SERVER || "",
    databaseName: process.env.DATABASE_NAME || "",
    jwtSecret: process.env.JWT_SECRET || "",
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "",
    authTokenExpiresIn: process.env.AUTH_TOKEN_EXPIRES_IN || "1h",
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    environment: process.env.NODE_ENV || "development",
    emailUser: process.env.EMAIL_USER || "",
    emailPassword: process.env.EMAIL_PASSWORD || "",
    authCookieMaxAge: parseInt(process.env.AUTH_COOKIE_MAX_AGE || "304800000"),
    refreshCookieMaxAge: parseInt(process.env.REFRESH_COOKIE_MAX_AGE || "604800000"),
    mainDomain: process.env.MAIN_DOMAIN || "",
    otpIssuer: process.env.OTP_ISSUER || "InsightPaper",
    forgotPasswordSecret: process.env.FORGOT_PASSWORD_SECRET || "",
    forgotPasswordTokenExpiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN || "1h",
};
exports.default = envConfig;
