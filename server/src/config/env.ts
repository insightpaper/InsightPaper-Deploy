import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

interface EnvConfig {
  port: number;
  llmServerUrl: string;
  clientBaseUrl: string;
  databaseUser: string;
  databasePassword: string;
  databaseServer: string;
  databaseName: string;
  jwtSecret: string;
  refreshTokenSecret: string;
  environment: string;
  emailUser: string;
  emailPassword: string;
  authTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
  authCookieMaxAge?: number;
  refreshCookieMaxAge?: number;
  mainDomain: string;
  otpIssuer: string;
  forgotPasswordSecret: string;
  forgotPasswordTokenExpiresIn: string;
}

const envConfig: EnvConfig = {
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
  refreshCookieMaxAge: parseInt(
    process.env.REFRESH_COOKIE_MAX_AGE || "604800000"
  ),
  mainDomain: process.env.MAIN_DOMAIN || "",
  otpIssuer: process.env.OTP_ISSUER || "InsightPaper",
  forgotPasswordSecret: process.env.FORGOT_PASSWORD_SECRET || "",
  forgotPasswordTokenExpiresIn:
    process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN || "1h",
};

export default envConfig;
