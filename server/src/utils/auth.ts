import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import envConfig from "../config/env";
import bcrypt from "bcrypt";
import { authenticator } from "otplib";
import { UserInterface } from "../interfaces/Users/User";
import { ValidationError } from "../errors/ValidationError";
import { InternalServerError } from "../errors/InternalError";
import crypto from "crypto";

authenticator.options = { digits: 6, step: 30 };
const saltRounds = 10;

/**
 * Function to generate a JWT token
 * @param user
 * @param refresh If true, the token is generated using the refresh token secret
 * @returns The JWT token
 */
export function generateToken(
  payload: UserInterface,
  refresh: boolean = false
): string {
  const secretKey: Secret = (refresh
    ? envConfig.refreshTokenSecret
    : envConfig.jwtSecret) as string;

  const options: SignOptions = {
    expiresIn: (refresh 
      ? envConfig.refreshTokenExpiresIn
      : envConfig.authTokenExpiresIn) as string,
  };

  return jwt.sign(payload, secretKey, options);
}

/**
 * Generate forgot password JWT token
 * @param payload
 * @returns The JWT token
 */
export function generateForgotPasswordToken(payload: {
  email: string;
  userId: string;
  tokenId: string | null;
}): { token: string; tokenId: string } {
  const tokenId = crypto.randomBytes(16).toString("hex");
  payload.tokenId = tokenId;

  const secretKey: Secret = envConfig.forgotPasswordSecret;
  const options: SignOptions = {
    expiresIn: envConfig.forgotPasswordTokenExpiresIn as string,
  };

  const token = jwt.sign(payload, secretKey, options);
  return { token, tokenId };
}

/**
 * Function to verify the forgot password token
 * @param token The JWT token to verify
 * @returns The user object from the token payload
 */
export async function verifyForgotPasswordToken(
  token: string
): Promise<{ email: string; userId: string, tokenId: string }> {
  try {
    if (!token || token === "") {
      throw new ValidationError("Token required", "invalid_token");
    }

    const decoded = jwt.verify(token, envConfig.forgotPasswordSecret) as {
      email: string;
      userId: string;
      tokenId: string;
    };

    console.log(decoded);
    if (!decoded || !decoded.userId || !decoded.email || !decoded.tokenId) {
      throw new ValidationError("Invalid token", "invalid_token");
    }

    return decoded;
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      throw new ValidationError(error.message, "invalid_token");
    } else if (error.name === "TokenExpiredError") {
      throw new ValidationError("Token expired", "token_expired");
    } else {
      console.error("Unexpected error during token verification", error);
      throw new InternalServerError("Internal server error");
    }
  }
}

/**
 * Generate a random hashed password
 * @returns The hashed password and the plain text password
 */
export async function generateRandomHashedPassword(): Promise<{
  hashedPassword: string;
  password: string;
}> {
  const password = generateRandomPassword();
  return { hashedPassword: await hashPassword(password), password };
}

/**
 * Generate a random password
 * @param length The length of the password to generate
 * @returns The generated password
 */
export function generateRandomPassword(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_+=?~";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars.charAt(randomIndex);
  }
  return password;
}

/**
 * Hashes the password using bcrypt
 * @param password
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

/**
 * Compares the entered password with the stored hash
 * @param enteredPassword
 * @param storedHash
 * @returns A boolean indicating if the password is correct
 */
export async function comparePassword(
  enteredPassword: string,
  storedHash: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(enteredPassword, storedHash);
  return isMatch;
}

/**
 * Generates one-time password
 * @param length
 * @returns The generated OTP and the expiry date
 */
export async function generateLocalOtp(
  length: number = 6
): Promise<{ otp: string; expiryDate: Date }> {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += crypto.randomInt(0, 10).toString();
  }
  const expiryDate = new Date();
  // Set expiry date to 30 minutes from now
  expiryDate.setMinutes(expiryDate.getMinutes() + 30);
  return { otp, expiryDate };
}

/**
 * Generates a hashed OTP
 * @param length
 * @returns The generated OTP, hashed OTP and the expiry date
 */
export async function generateHashedLocalOtp(
  length: number = 6
): Promise<{ otp: string; hashedOtp: string; expiryDate: Date }> {
  const { otp, expiryDate } = await generateLocalOtp(length);
  const hashedOtp = await hashPassword(otp);

  return { otp, hashedOtp, expiryDate };
}

/**
 * Function to verify the JWT token
 * @param token The JWT token to verify
 * @param refresh If true, the token is verified using the refresh token secret
 * @returns The user object from the token payload
 */
export async function verifyToken(
  token: string,
  refresh: boolean = false
): Promise<UserInterface> {
  try {
    if (!token) {
      throw new ValidationError("Token required", "invalid_token");
    }
    const decoded = jwt.verify(
      token,
      refresh ? envConfig.refreshTokenSecret : envConfig.jwtSecret
    ) as JwtPayload;

    if (!decoded || !decoded.userId || !decoded.email) {
      throw new ValidationError("Invalid token", "invalid_token");
    }

    const user: UserInterface = {
      userId: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      pictureUrl: decoded.pictureUrl,
      passwordChanged: decoded.passwordChanged,
      doubleFactorEnabled: decoded.doubleFactorEnabled,
      createdDate: decoded.createdDate,
      modifiedDate: decoded.modified,
      roles: decoded.roles,
    };

    return user;
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      throw new ValidationError(error.message, "invalid_token");
    } else if (error.name === "TokenExpiredError") {
      throw new ValidationError("Token expired", "invalid_token");
    } else {
      console.error("Unexpected error during token verification", error);
      throw new InternalServerError("Internal server error");
    }
  }
}

/**
 * Function to generate a OTP secret
 * @returns The OTP secret and the URI for the QR code
 */
export function generateOtpSecret(email: string): {
  secret: string;
  uri: string;
} {
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(email, envConfig.otpIssuer, secret);

  return { secret, uri };
}

/**
 * Function to verify the OTP
 * @param otp The OTP to verify
 * @param secret The OTP secret
 * @returns A boolean indicating if the OTP is correct
 */
export function verifyOtp(otp: string, secret: string): boolean {
  return authenticator.verify({ token: otp, secret });
}
