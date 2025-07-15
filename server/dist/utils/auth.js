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
exports.generateToken = generateToken;
exports.generateForgotPasswordToken = generateForgotPasswordToken;
exports.verifyForgotPasswordToken = verifyForgotPasswordToken;
exports.generateRandomHashedPassword = generateRandomHashedPassword;
exports.generateRandomPassword = generateRandomPassword;
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateLocalOtp = generateLocalOtp;
exports.generateHashedLocalOtp = generateHashedLocalOtp;
exports.verifyToken = verifyToken;
exports.generateOtpSecret = generateOtpSecret;
exports.verifyOtp = verifyOtp;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const otplib_1 = require("otplib");
const ValidationError_1 = require("../errors/ValidationError");
const InternalError_1 = require("../errors/InternalError");
const crypto_1 = __importDefault(require("crypto"));
otplib_1.authenticator.options = { digits: 6, step: 30 };
const saltRounds = 10;
/**
 * Function to generate a JWT token
 * @param user
 * @param refresh If true, the token is generated using the refresh token secret
 * @returns The JWT token
 */
function generateToken(payload, refresh = false) {
    const secretKey = refresh
        ? env_1.default.refreshTokenSecret
        : env_1.default.jwtSecret;
    const options = {
        expiresIn: refresh ? 604800 /* 7d */ : 3600 /* 1h */,
    };
    return jsonwebtoken_1.default.sign(payload, secretKey, options);
}
/**
 * Generate forgot password JWT token
 * @param payload
 * @returns The JWT token
 */
function generateForgotPasswordToken(payload) {
    const tokenId = crypto_1.default.randomBytes(16).toString("hex");
    payload.tokenId = tokenId;
    const secretKey = env_1.default.forgotPasswordSecret;
    const options = {
        expiresIn: 900 /* 15 min */,
    };
    const token = jsonwebtoken_1.default.sign(payload, secretKey, options);
    return { token, tokenId };
}
/**
 * Function to verify the forgot password token
 * @param token The JWT token to verify
 * @returns The user object from the token payload
 */
function verifyForgotPasswordToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!token || token === "") {
                throw new ValidationError_1.ValidationError("Token required", "invalid_token");
            }
            const decoded = jsonwebtoken_1.default.verify(token, env_1.default.forgotPasswordSecret);
            console.log(decoded);
            if (!decoded || !decoded.userId || !decoded.email || !decoded.tokenId) {
                throw new ValidationError_1.ValidationError("Invalid token", "invalid_token");
            }
            return decoded;
        }
        catch (error) {
            if (error.name === "JsonWebTokenError") {
                throw new ValidationError_1.ValidationError(error.message, "invalid_token");
            }
            else if (error.name === "TokenExpiredError") {
                throw new ValidationError_1.ValidationError("Token expired", "token_expired");
            }
            else {
                console.error("Unexpected error during token verification", error);
                throw new InternalError_1.InternalServerError("Internal server error");
            }
        }
    });
}
/**
 * Generate a random hashed password
 * @returns The hashed password and the plain text password
 */
function generateRandomHashedPassword() {
    return __awaiter(this, void 0, void 0, function* () {
        const password = generateRandomPassword();
        return { hashedPassword: yield hashPassword(password), password };
    });
}
/**
 * Generate a random password
 * @param length The length of the password to generate
 * @returns The generated password
 */
function generateRandomPassword(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_+=?~";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto_1.default.randomInt(0, chars.length);
        password += chars.charAt(randomIndex);
    }
    return password;
}
/**
 * Hashes the password using bcrypt
 * @param password
 * @returns The hashed password
 */
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
        return hashedPassword;
    });
}
/**
 * Compares the entered password with the stored hash
 * @param enteredPassword
 * @param storedHash
 * @returns A boolean indicating if the password is correct
 */
function comparePassword(enteredPassword, storedHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const isMatch = yield bcrypt_1.default.compare(enteredPassword, storedHash);
        return isMatch;
    });
}
/**
 * Generates one-time password
 * @param length
 * @returns The generated OTP and the expiry date
 */
function generateLocalOtp() {
    return __awaiter(this, arguments, void 0, function* (length = 6) {
        let otp = "";
        for (let i = 0; i < length; i++) {
            otp += crypto_1.default.randomInt(0, 10).toString();
        }
        const expiryDate = new Date();
        // Set expiry date to 30 minutes from now
        expiryDate.setMinutes(expiryDate.getMinutes() + 30);
        return { otp, expiryDate };
    });
}
/**
 * Generates a hashed OTP
 * @param length
 * @returns The generated OTP, hashed OTP and the expiry date
 */
function generateHashedLocalOtp() {
    return __awaiter(this, arguments, void 0, function* (length = 6) {
        const { otp, expiryDate } = yield generateLocalOtp(length);
        const hashedOtp = yield hashPassword(otp);
        return { otp, hashedOtp, expiryDate };
    });
}
/**
 * Function to verify the JWT token
 * @param token The JWT token to verify
 * @param refresh If true, the token is verified using the refresh token secret
 * @returns The user object from the token payload
 */
function verifyToken(token_1) {
    return __awaiter(this, arguments, void 0, function* (token, refresh = false) {
        try {
            if (!token) {
                throw new ValidationError_1.ValidationError("Token required", "invalid_token");
            }
            const decoded = jsonwebtoken_1.default.verify(token, refresh ? env_1.default.refreshTokenSecret : env_1.default.jwtSecret);
            if (!decoded || !decoded.userId || !decoded.email) {
                throw new ValidationError_1.ValidationError("Invalid token", "invalid_token");
            }
            const user = {
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
        }
        catch (error) {
            if (error.name === "JsonWebTokenError") {
                throw new ValidationError_1.ValidationError(error.message, "invalid_token");
            }
            else if (error.name === "TokenExpiredError") {
                throw new ValidationError_1.ValidationError("Token expired", "invalid_token");
            }
            else {
                console.error("Unexpected error during token verification", error);
                throw new InternalError_1.InternalServerError("Internal server error");
            }
        }
    });
}
/**
 * Function to generate a OTP secret
 * @returns The OTP secret and the URI for the QR code
 */
function generateOtpSecret(email) {
    const secret = otplib_1.authenticator.generateSecret();
    const uri = otplib_1.authenticator.keyuri(email, env_1.default.otpIssuer, secret);
    return { secret, uri };
}
/**
 * Function to verify the OTP
 * @param otp The OTP to verify
 * @param secret The OTP secret
 * @returns A boolean indicating if the OTP is correct
 */
function verifyOtp(otp, secret) {
    return otplib_1.authenticator.verify({ token: otp, secret });
}
