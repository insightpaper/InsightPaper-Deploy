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
const ValidationError_1 = require("../errors/ValidationError");
const user_1 = __importDefault(require("../daos/user"));
const env_1 = __importDefault(require("../config/env"));
const qrcode_1 = __importDefault(require("qrcode"));
const tokens_1 = __importDefault(require("../daos/tokens"));
const auth_1 = require("../utils/auth");
const emailService_1 = require("../services/emailService");
const course_1 = __importDefault(require("../daos/course"));
class UsersController {
    /**
     * Function to get all users
     * @param req
     * @param res
     */
    static getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const roleFilter = req.query.roleFilter;
                // Split the roleFilter string into an array and trims the values and removes empty values like ""
                const rolesArray = roleFilter === null || roleFilter === void 0 ? void 0 : roleFilter.split(",").map((role) => role.trim()).filter((role) => role !== "");
                const result = yield user_1.default.getAllUsers(Number(req.query.pageNumber), Number(req.query.pageSize), req.query.filter, req.query.orderBy, req.query.orderDirection, rolesArray, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting all users", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get a user by email
     * @param req
     * @param res
     */
    static getUserByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield user_1.default.getUserByEmail(req.params.email);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting user by email", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get a user by id
     * @param req
     * @param res
     */
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield user_1.default.getUserById(req.params.userId, requesterUserId);
                res.status(200).json(Object.assign({}, result));
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting user by id", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Verifies the JWT token and returns the payload
     * @param req Request object
     * @param res Response object
     * @returns Response with payload
     */
    static authenticateToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = req.body.payload;
                res.status(200).json(payload);
            }
            catch (error) {
                res.status(401).json({ error: "unauthorized" });
            }
        });
    }
    /**
     * Refreshes the JWT token
     * @param req Request object
     * @param res Response object
     * @returns Response with success message
     */
    static refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const refreshToken = req.cookies.refresh;
                if (!refreshToken) {
                    res.status(401).json({ error: "unauthorized" });
                    return;
                }
                const user = yield (0, auth_1.verifyToken)(refreshToken, true);
                const newUserData = yield user_1.default.getUserByEmail(user.email);
                const authToken = (0, auth_1.generateToken)(newUserData);
                res.cookie("auth", authToken, {
                    domain: env_1.default.mainDomain,
                    httpOnly: true,
                    secure: env_1.default.environment === "production",
                    sameSite: "lax",
                    maxAge: env_1.default.authCookieMaxAge,
                });
                res.status(200).json({ result: "Token refreshed" });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(401).json({ error: error.cause });
                }
                else {
                    console.error("Error refreshing token", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Verifies the user's login credentials and sends an OTP
     * @param req Request object
     * @param res Response object
     * @returns Response with success message
     */
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { email, password } = req.body;
                // Check if email and password are provided
                if (!email) {
                    res.status(400).json({ result: "user_email_required" });
                    return;
                }
                if (!password) {
                    res.status(400).json({ result: "password_required" });
                    return;
                }
                const user = yield user_1.default.getUserByEmail(email);
                const passwordMatch = yield (0, auth_1.comparePassword)(password, (_a = user.password) !== null && _a !== void 0 ? _a : "");
                if (!passwordMatch) {
                    res.status(400).json({ result: "invalid_credentials" });
                    return;
                }
                if (user.doubleFactorEnabled) {
                    res.status(200).json({
                        result: true,
                        doubleFactorEnabled: user.doubleFactorEnabled,
                    });
                    return;
                }
                const { otp, expiryDate, hashedOtp } = yield (0, auth_1.generateHashedLocalOtp)();
                const otpUpdated = yield user_1.default.updateUserOtpByEmail(email, hashedOtp, expiryDate);
                if (!otpUpdated) {
                    res.status(400).json({ result: "otp_error" });
                    return;
                }
                const isSent = yield (0, emailService_1.sendOtp)(email, otp);
                if (!isSent) {
                    res.status(400).json({ result: "otp_error" });
                    return;
                }
                res.status(200).json({
                    result: isSent,
                    doubleFactorEnabled: user.doubleFactorEnabled,
                });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error during login", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Middleware to authenticate the OTP sent to the user
     * @param req Request object
     * @param res Response object
     * @param next Next function
     */
    static authenticateOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const user = email ? yield user_1.default.getUserByEmail(email) : req.user;
                req.user = user;
                console.log("Test 1");
                if (user.doubleFactorEnabled) {
                    const secret = yield user_1.default.getUserOtpSecretByEmail(user.email);
                    console.log("Test 2");
                    const otpMatch = (0, auth_1.verifyOtp)(otp, secret);
                    if (!otpMatch) {
                        res.status(401).json({ result: "otp_invalid" });
                        return;
                    }
                }
                else {
                    const userOtp = yield user_1.default.getUserOtpByEmail(user.email);
                    console.log("Test 3");
                    if (!userOtp.securityCodeExpiration || !userOtp.securityCode) {
                        res.status(401).json({ result: "otp_invalid" });
                        return;
                    }
                    if (new Date() > userOtp.securityCodeExpiration) {
                        res.status(401).json({ result: "otp_invalid" });
                        return;
                    }
                    console.log("Test 4");
                    const otpMatch = yield (0, auth_1.comparePassword)(otp, userOtp.securityCode);
                    if (!otpMatch) {
                        res.status(401).json({ result: "otp_invalid" });
                        return;
                    }
                }
                next();
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error authenticating OTP", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Verifies the OTP sent to the user during login and creates a session
     * @param req Request object
     * @param res Response object
     * @returns Response with success message
     */
    static verifyLoginOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const user = req.user;
                console.log("Test-verify 1", user);
                if (!user.doubleFactorEnabled) {
                    const isInvalidated = yield user_1.default.invalidateUserOtpByEmail(email);
                    if (!isInvalidated) {
                        res.status(400).json({ result: "otp_invalid" });
                        return;
                    }
                }
                const authToken = (0, auth_1.generateToken)(user);
                console.log("Test-verify 2", authToken);
                const refreshToken = (0, auth_1.generateToken)(user, true);
                console.log("Test-verify 3", refreshToken);
                console.log("Test-verify 4", env_1.default.mainDomain);
                res.cookie("auth", authToken, {
                    domain: ".onrender.com",
                    httpOnly: true,
                    secure: env_1.default.environment === "production",
                    sameSite: "lax",
                    maxAge: env_1.default.authCookieMaxAge,
                });
                console.log("Test-verify 5");
                res.cookie("refresh", refreshToken, {
                    domain: env_1.default.mainDomain,
                    httpOnly: true,
                    secure: env_1.default.environment === "production",
                    sameSite: "lax",
                    maxAge: env_1.default.refreshCookieMaxAge,
                });
                console.log("Test-verify 6");
                res.status(200).json({ result: true });
            }
            catch (error) {
                console.log("Test-verify error", error);
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error verifying login OTP", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Sends an OTP to the user's email to reset their password
     * @param req Request object
     * @param res Response object
     * @returns Response with success message
     */
    static requestPasswordRecovery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    res.status(400).json({ result: "user_email_required" });
                    return;
                }
                const user = yield user_1.default.getUserByEmail(email);
                const { token, tokenId } = (0, auth_1.generateForgotPasswordToken)({
                    email: user.email,
                    userId: user.userId,
                    tokenId: null,
                });
                yield tokens_1.default.createToken(tokenId);
                const isSent = yield (0, emailService_1.sendPasswordResetEmail)(email, token);
                res.status(200).json({ result: isSent });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error resetting password", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Verifies the token sent to the user's email and allows them to change their password
     * @param req Request object
     * @param res Response object
     * @returns Response with success message
     */
    static confirmPasswordRecovery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPassword } = req.body;
                const { userId, tokenId } = yield (0, auth_1.verifyForgotPasswordToken)(token);
                const savedToken = yield tokens_1.default.getTokenById(tokenId);
                if (!savedToken) {
                    res.status(400).json({ result: "invalid_token" });
                    return;
                }
                if (savedToken.isUsed) {
                    res.status(400).json({ result: "token_used" });
                    return;
                }
                const hashedPassword = yield (0, auth_1.hashPassword)(newPassword);
                const result = yield user_1.default.updateUserPassword(userId, hashedPassword, userId, req.ip, req.headers["user-agent"]);
                yield tokens_1.default.useToken(tokenId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error resetting password", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Changes the user's password after verifying the OTP
     * @param req Request object
     * @param res Response object
     * @returns Response with success message
     */
    static changeMyPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { password } = req.body;
                const user = req.user;
                if (!password) {
                    res.status(400).json({ result: "password_required" });
                    return;
                }
                const hashedPassword = yield (0, auth_1.hashPassword)(password);
                yield user_1.default.updateUserPassword(user.userId, hashedPassword, user.userId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result: true });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error changing password", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to change the password of a user
     * @param req
     * @param res
     */
    static changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const currentUserId = req.user.userId;
                const { password } = req.body;
                const hashedPassword = yield (0, auth_1.hashPassword)(password);
                const result = yield user_1.default.updateUserPassword(userId, hashedPassword, currentUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error changing password", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to send an OTP to the user's email
     * @param req Request object
     * @param res Response object
     * @returns Response with success message
     */
    static sendOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    res.status(400).json({ result: "user_email_required" });
                    return;
                }
                const { otp, expiryDate, hashedOtp } = yield (0, auth_1.generateHashedLocalOtp)();
                const isUpdated = yield user_1.default.updateUserOtpByEmail(email, hashedOtp, expiryDate);
                if (!isUpdated) {
                    res.status(400).json({ result: "otp_error" });
                    return;
                }
                const otpSent = yield (0, emailService_1.sendOtp)(email, otp);
                if (!otpSent) {
                    res.status(400).json({ result: "otp_error" });
                    return;
                }
                res.status(200).json({ result: otpSent });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error resending OTP", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Temporal function to create an admin user
     * @param req
     * @param res
     */
    static createAdminUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, password, userId } = req.body;
                const hashedPassword = yield (0, auth_1.hashPassword)(password);
                const result = yield user_1.default.createAdminUser(name, email, hashedPassword, userId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error creating admin user", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Temporal function to create an professor user
     * @param req
     * @param res
     */
    static createProfessorUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { name, email } = req.body;
                const requesterUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                const { password, hashedPassword } = yield (0, auth_1.generateRandomHashedPassword)();
                const result = yield user_1.default.createProfessorUser(name, email, hashedPassword, requesterUserId, req.ip, req.headers["user-agent"]);
                const isSent = yield (0, emailService_1.sendNewAccountNotification)(email, password);
                res.status(200).json({ result: result, mailSent: isSent });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error creating professor user", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to create a user
     * @param req
     * @param res
     */
    static createStudentUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, newPassword } = req.body;
                const user = { name, email };
                const hashedPassword = yield (0, auth_1.hashPassword)(newPassword);
                user.password = hashedPassword;
                const result = yield user_1.default.createStudentUser(user);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                console.error("Error creating user", error);
                res.status(500).json({ error: "unexpected_error" });
            }
        });
    }
    /**
     * Function to update an user
     * @param req
     * @param res
     */
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, name, email, pictureUrl, linkToPortfolio, creatorTypes } = req.body;
                const userData = {
                    userId,
                    name,
                    email,
                    pictureUrl,
                };
                const requesterUserId = req.user.userId;
                const result = yield user_1.default.updateUser(userData, linkToPortfolio, creatorTypes, requesterUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error updating user", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to delete a user
     * @param req
     * @param res
     */
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const requesterUserId = req.user.userId;
                const result = yield user_1.default.deleteUser(userId, requesterUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error deleting user", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to enable OTP Auth App
     * @param req
     * @param res
     */
    static enableOtpAuthApp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const currentUserId = req.user.userId;
                const email = req.user.email;
                if (req.user.doubleFactorEnabled) {
                    res.status(400).json({ error: "otp_already_enabled" });
                    return;
                }
                const { secret, uri } = (0, auth_1.generateOtpSecret)(email);
                const qrCode = yield qrcode_1.default.toDataURL(uri);
                const result = yield user_1.default.updateUserOtpSecret(userId, secret, currentUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result, qrCode, secret });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error enabling OTP Auth App", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to disable OTP Auth App
     * @param req
     * @param res
     */
    static disableOtpAuthApp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const currentUserId = req.user.userId;
                const result = yield user_1.default.disableOtpAuthApp(userId, currentUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error disabling OTP Auth App", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to confirm and activate the OTP Auth App
     * @param req
     * @param res
     */
    static confirmOtpActivation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp } = req.body;
                const { userId } = req.params;
                const user = req.user;
                const secret = yield user_1.default.getUserOtpSecretByEmail(user.email);
                const otpMatch = (0, auth_1.verifyOtp)(otp, secret);
                if (!otpMatch) {
                    res.status(401).json({ result: "otp_invalid" });
                    return;
                }
                const result = yield user_1.default.enableOtpAuthApp(userId, user.userId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error confirming OTP activation", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to logout a user
     * @param req
     * @param res
     */
    static logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("auth", {
                    domain: env_1.default.mainDomain,
                    httpOnly: true,
                    secure: env_1.default.environment === "production",
                    sameSite: "lax",
                });
                res.clearCookie("refresh", {
                    domain: env_1.default.mainDomain,
                    httpOnly: true,
                    secure: env_1.default.environment === "production",
                    sameSite: "lax",
                });
                res.status(200).json({ result: true });
            }
            catch (error) {
                console.error("Error logging out", error);
                res.status(500).json({ error: "unexpected_error" });
            }
        });
    }
    static updateUserRoles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roles } = req.body;
                const userId = req.params.userId;
                const requesterUserId = req.user.userId;
                const result = yield user_1.default.updateUserRoles(userId, roles, requesterUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                console.error("Error updating user roles", error);
                res.status(500).json({ error: "unexpected_error" });
            }
        });
    }
    /**
     * Function to delete a user
     * @param req
     * @param res
     */
    static deleteProfessor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const professorId = req.params.userId;
                const requesterUserId = req.user.userId;
                const result = yield user_1.default.deleteProfessor(professorId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error deleting professor", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    static getStudents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield user_1.default.getStudents(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the list of students by id", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to delete an account
     * @param req
     * @param res
     */
    static deleteAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield user_1.default.deleteAccount(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error deleting the account", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get the professor details
     * @param req
     * @param res
     */
    static getProfessorDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const requesterUserId = req.user.userId;
                const result = yield user_1.default.getProfessorDetails(userId, requesterUserId);
                res.status(200).json(Object.assign({}, result));
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the profesor details", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to create a recommendation
     * @param req
     * @param res
     * @returns
     *  */
    static createRecommendation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const documentId = req.params.documentId;
                const courseId = req.params.courseId;
                const result = yield user_1.default.createRecommendation(documentId, courseId, requesterUserId);
                const emails = yield course_1.default.getCourseEmails(courseId, requesterUserId);
                let allSent = true;
                for (const { courseName, studentEmail } of emails) {
                    try {
                        const answer = yield (0, emailService_1.sendNotificationNewRecommendation)(studentEmail, courseName);
                        if (!answer) {
                            console.warn(`No se pudo enviar correo a ${studentEmail}`);
                            allSent = false;
                        }
                    }
                    catch (error) {
                        console.error(`Error al enviar a ${studentEmail}:`, error);
                        allSent = false;
                    }
                }
                if (!allSent) {
                    res.status(400).json({ result: "notification_error" });
                    return;
                }
                res.status(200).json({ lastNotificationId: result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error creating a recommendation", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    static getProfesorsActivity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const professorId = req.params.professorId;
                const result = yield user_1.default.getProfesorsActivity(requesterUserId, professorId);
                res.status(200).json(result);
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the professor activity", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    static getStudentsMetrics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const courseId = req.params.courseId;
                const result = yield user_1.default.getStudentsMetrics(requesterUserId, courseId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the students metrics", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
}
exports.default = UsersController;
