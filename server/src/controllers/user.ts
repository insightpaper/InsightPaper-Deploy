import { ValidationError } from "../errors/ValidationError";
import { NextFunction, Request, Response } from "express";
import UsersDao from "../daos/user";
import { UserInterface } from "../interfaces/Users/User";
import envConfig from "../config/env";
import QRcode from "qrcode";
import TokenDao from "../daos/tokens";
import {
  generateHashedLocalOtp,
  verifyToken,
  generateToken,
  comparePassword,
  hashPassword,
  generateOtpSecret,
  verifyOtp,
  generateForgotPasswordToken,
  verifyForgotPasswordToken,
  generateRandomHashedPassword,
} from "../utils/auth";
import {
  sendNewAccountNotification,
  sendNotificationNewRecommendation,
  sendOtp,
  sendPasswordResetEmail,
} from "../services/emailService";
import CoursesDao from "../daos/course";
export default class UsersController {
  /**
   * Function to get all users
   * @param req
   * @param res
   */
  public static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const roleFilter = req.query.roleFilter as string;

      // Split the roleFilter string into an array and trims the values and removes empty values like ""
      const rolesArray = roleFilter
        ?.split(",")
        .map((role) => role.trim())
        .filter((role) => role !== "");

      const result = await UsersDao.getAllUsers(
        Number(req.query.pageNumber),
        Number(req.query.pageSize),
        req.query.filter as string,
        req.query.orderBy as string,
        req.query.orderDirection as string,
        rolesArray,
        requesterUserId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting all users", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get a user by email
   * @param req
   * @param res
   */
  public static async getUserByEmail(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const result = await UsersDao.getUserByEmail(req.params.email);
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting user by email", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get a user by id
   * @param req
   * @param res
   */
  public static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await UsersDao.getUserById(
        req.params.userId,
        requesterUserId
      );
      res.status(200).json({ ...result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting user by id", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Verifies the JWT token and returns the payload
   * @param req Request object
   * @param res Response object
   * @returns Response with payload
   */
  public static async authenticateToken(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const payload = req.body.payload;

      res.status(200).json(payload);
    } catch (error) {
      res.status(401).json({ error: "unauthorized" });
    }
  }

  /**
   * Refreshes the JWT token
   * @param req Request object
   * @param res Response object
   * @returns Response with success message
   */
  public static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refresh;

      if (!refreshToken) {
        res.status(401).json({ error: "unauthorized" });
        return;
      }

      const user = await verifyToken(refreshToken, true);

      const newUserData = await UsersDao.getUserByEmail(user.email);
      const authToken = generateToken(newUserData);

      res.cookie("auth", authToken, {
        domain: envConfig.mainDomain,
        httpOnly: true,
        secure: envConfig.environment === "production",
        sameSite: "lax",
        maxAge: envConfig.authCookieMaxAge,
      });

      res.status(200).json({ result: "Token refreshed" });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(401).json({ error: error.cause });
      } else {
        console.error("Error refreshing token", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Verifies the user's login credentials and sends an OTP
   * @param req Request object
   * @param res Response object
   * @returns Response with success message
   */
  public static async login(req: Request, res: Response): Promise<void> {
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

      const user = await UsersDao.getUserByEmail(email);

      const passwordMatch = await comparePassword(
        password,
        user.password ?? ""
      );

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

      const { otp, expiryDate, hashedOtp } = await generateHashedLocalOtp();

      const otpUpdated = await UsersDao.updateUserOtpByEmail(
        email,
        hashedOtp,
        expiryDate
      );

      if (!otpUpdated) {
        res.status(400).json({ result: "otp_error" });
        return;
      }

      const isSent = await sendOtp(email, otp);

      if (!isSent) {
        res.status(400).json({ result: "otp_error" });
        return;
      }

      res.status(200).json({
        result: isSent,
        doubleFactorEnabled: user.doubleFactorEnabled,
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error during login", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Middleware to authenticate the OTP sent to the user
   * @param req Request object
   * @param res Response object
   * @param next Next function
   */
  public static async authenticateOtp(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, otp } = req.body;

      const user = email ? await UsersDao.getUserByEmail(email) : req.user;

      req.user = user;

      console.log("Test 1")

      if (user.doubleFactorEnabled) {
        const secret = await UsersDao.getUserOtpSecretByEmail(user.email);

        console.log("Test 2")

        const otpMatch = verifyOtp(otp, secret);
        if (!otpMatch) {
          res.status(401).json({ result: "otp_invalid" });
          return;
        }
      } else {
        const userOtp = await UsersDao.getUserOtpByEmail(user.email);

        console.log("Test 3")

        if (!userOtp.securityCodeExpiration || !userOtp.securityCode) {
          res.status(401).json({ result: "otp_invalid" });
          return;
        }

        if (new Date() > userOtp.securityCodeExpiration) {
          res.status(401).json({ result: "otp_invalid" });
          return;
        }

        console.log("Test 4")

        const otpMatch = await comparePassword(otp, userOtp.securityCode);

        if (!otpMatch) {
          res.status(401).json({ result: "otp_invalid" });
          return;
        }
      }

      next();
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error authenticating OTP", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Verifies the OTP sent to the user during login and creates a session
   * @param req Request object
   * @param res Response object
   * @returns Response with success message
   */
  public static async verifyLoginOtp(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.body;

      const user = req.user;

      console.log("Test-verify 1", user)

      if (!user.doubleFactorEnabled) {
        const isInvalidated = await UsersDao.invalidateUserOtpByEmail(email);

        if (!isInvalidated) {
          res.status(400).json({ result: "otp_invalid" });
          return;
        }
      }

      const authToken = generateToken(user);

      console.log("Test-verify 2", authToken)

      const refreshToken = generateToken(user, true);

      console.log("Test-verify 3", refreshToken)
      console.log("Test-verify 4", envConfig.mainDomain)

      console.log("Test-verify 5", envConfig.environment)

      res.cookie("auth", authToken, {
        domain: ".onrender.com",
        httpOnly: true,
        secure: envConfig.environment === "production",
        sameSite: "none",
        maxAge: envConfig.authCookieMaxAge,
      });

      console.log("Test-verify 5", envConfig.environment)

      res.cookie("refresh", refreshToken, {
        domain: envConfig.mainDomain,
        httpOnly: true,
        secure: envConfig.environment === "production",
        sameSite: "none",
        maxAge: envConfig.refreshCookieMaxAge,
      });

      console.log("Test-verify 6")

      res.status(200).json({ result: true });
    } catch (error: any) {
      console.log("Test-verify error", error)
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error verifying login OTP", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Sends an OTP to the user's email to reset their password
   * @param req Request object
   * @param res Response object
   * @returns Response with success message
   */
  public static async requestPasswordRecovery(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ result: "user_email_required" });
        return;
      }

      const user = await UsersDao.getUserByEmail(email);

      const { token, tokenId } = generateForgotPasswordToken({
        email: user.email,
        userId: user.userId,
        tokenId: null,
      });

      await TokenDao.createToken(tokenId);

      const isSent = await sendPasswordResetEmail(email, token);

      res.status(200).json({ result: isSent });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error resetting password", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Verifies the token sent to the user's email and allows them to change their password
   * @param req Request object
   * @param res Response object
   * @returns Response with success message
   */
  public static async confirmPasswordRecovery(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      const { userId, tokenId } = await verifyForgotPasswordToken(token);

      const savedToken = await TokenDao.getTokenById(tokenId);

      if (!savedToken) {
        res.status(400).json({ result: "invalid_token" });
        return;
      }

      if (savedToken.isUsed) {
        res.status(400).json({ result: "token_used" });
        return;
      }

      const hashedPassword = await hashPassword(newPassword);

      const result = await UsersDao.updateUserPassword(
        userId,
        hashedPassword,
        userId,
        req.ip,
        req.headers["user-agent"]
      );

      await TokenDao.useToken(tokenId);

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error resetting password", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Changes the user's password after verifying the OTP
   * @param req Request object
   * @param res Response object
   * @returns Response with success message
   */
  public static async changeMyPassword(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { password } = req.body;

      const user = req.user;

      if (!password) {
        res.status(400).json({ result: "password_required" });
        return;
      }

      const hashedPassword = await hashPassword(password);

      await UsersDao.updateUserPassword(
        user.userId,
        hashedPassword,
        user.userId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result: true });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error changing password", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to change the password of a user
   * @param req
   * @param res
   */
  public static async changePassword(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user.userId;

      const { password } = req.body;

      const hashedPassword = await hashPassword(password);

      const result = await UsersDao.updateUserPassword(
        userId,
        hashedPassword,
        currentUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error changing password", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to send an OTP to the user's email
   * @param req Request object
   * @param res Response object
   * @returns Response with success message
   */
  public static async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ result: "user_email_required" });
        return;
      }

      const { otp, expiryDate, hashedOtp } = await generateHashedLocalOtp();

      const isUpdated = await UsersDao.updateUserOtpByEmail(
        email,
        hashedOtp,
        expiryDate
      );

      if (!isUpdated) {
        res.status(400).json({ result: "otp_error" });
        return;
      }

      const otpSent = await sendOtp(email, otp);

      if (!otpSent) {
        res.status(400).json({ result: "otp_error" });
        return;
      }

      res.status(200).json({ result: otpSent });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error resending OTP", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Temporal function to create an admin user
   * @param req
   * @param res
   */
  public static async createAdminUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { name, email, password, userId } = req.body;

      const hashedPassword = await hashPassword(password);

      const result = await UsersDao.createAdminUser(
        name,
        email,
        hashedPassword,
        userId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error creating admin user", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Temporal function to create an professor user
   * @param req
   * @param res
   */
  public static async createProfessorUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { name, email } = req.body;

      const requesterUserId = req.user?.userId;

      const { password, hashedPassword } = await generateRandomHashedPassword();

      const result = await UsersDao.createProfessorUser(
        name,
        email,
        hashedPassword,
        requesterUserId,
        req.ip,
        req.headers["user-agent"]
      );

      const isSent = await sendNewAccountNotification(email, password);
      res.status(200).json({ result: result, mailSent: isSent });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error creating professor user", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to create a user
   * @param req
   * @param res
   */
  public static async createStudentUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { name, email, newPassword } = req.body;
      const user = { name, email } as UserInterface;

      const hashedPassword = await hashPassword(newPassword);
      user.password = hashedPassword;

      const result = await UsersDao.createStudentUser(user);

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      }
      console.error("Error creating user", error);
      res.status(500).json({ error: "unexpected_error" });
    }
  }

  /**
   * Function to update an user
   * @param req
   * @param res
   */
  public static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, name, email, pictureUrl, linkToPortfolio, creatorTypes } =
        req.body;

      const userData = {
        userId,
        name,
        email,
        pictureUrl,
      } as UserInterface;

      const requesterUserId = req.user.userId;

      const result = await UsersDao.updateUser(
        userData,
        linkToPortfolio,
        creatorTypes,
        requesterUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error updating user", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to delete a user
   * @param req
   * @param res
   */
  public static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const requesterUserId = req.user.userId;

      const result = await UsersDao.deleteUser(
        userId,
        requesterUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error deleting user", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to enable OTP Auth App
   * @param req
   * @param res
   */
  public static async enableOtpAuthApp(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user.userId;
      const email = req.user.email;

      if (req.user.doubleFactorEnabled) {
        res.status(400).json({ error: "otp_already_enabled" });
        return;
      }

      const { secret, uri } = generateOtpSecret(email);

      const qrCode = await QRcode.toDataURL(uri);
      const result = await UsersDao.updateUserOtpSecret(
        userId,
        secret,
        currentUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result, qrCode, secret });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error enabling OTP Auth App", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to disable OTP Auth App
   * @param req
   * @param res
   */
  public static async disableOtpAuthApp(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const currentUserId = req.user.userId;

      const result = await UsersDao.disableOtpAuthApp(
        userId,
        currentUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error disabling OTP Auth App", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to confirm and activate the OTP Auth App
   * @param req
   * @param res
   */
  public static async confirmOtpActivation(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { otp } = req.body;
      const { userId } = req.params;
      const user = req.user;
      const secret = await UsersDao.getUserOtpSecretByEmail(user.email);
      const otpMatch = verifyOtp(otp, secret);

      if (!otpMatch) {
        res.status(401).json({ result: "otp_invalid" });
        return;
      }

      const result = await UsersDao.enableOtpAuthApp(
        userId,
        user.userId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error confirming OTP activation", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to logout a user
   * @param req
   * @param res
   */
  public static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("auth", {
        domain: envConfig.mainDomain,
        httpOnly: true,
        secure: envConfig.environment === "production",
        sameSite: "lax",
      });

      res.clearCookie("refresh", {
        domain: envConfig.mainDomain,
        httpOnly: true,
        secure: envConfig.environment === "production",
        sameSite: "lax",
      });

      res.status(200).json({ result: true });
    } catch (error: any) {
      console.error("Error logging out", error);
      res.status(500).json({ error: "unexpected_error" });
    }
  }

  public static async updateUserRoles(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { roles } = req.body;
      const userId = req.params.userId;
      const requesterUserId = req.user.userId;

      const result = await UsersDao.updateUserRoles(
        userId,
        roles,
        requesterUserId,
        req.ip,
        req.headers["user-agent"]
      );

      res.status(200).json({ result });
    } catch (error: any) {
      console.error("Error updating user roles", error);
      res.status(500).json({ error: "unexpected_error" });
    }
  }

  /**
   * Function to delete a user
   * @param req
   * @param res
   */
  public static async deleteProfessor(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const professorId = req.params.userId;
      const requesterUserId = req.user.userId;

      const result = await UsersDao.deleteProfessor(
        professorId,
        requesterUserId
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error deleting professor", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  public static async getStudents(req: Request, res: Response): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await UsersDao.getStudents(requesterUserId);
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the list of students by id", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }
  /**
   * Function to delete an account
   * @param req
   * @param res
   */
  public static async deleteAccount(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await UsersDao.deleteAccount(requesterUserId);

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error deleting the account", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get the professor details
   * @param req
   * @param res
   */
  public static async getProfessorDetails(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.params.userId;
      const requesterUserId = req.user.userId;

      const result = await UsersDao.getProfessorDetails(
        userId,
        requesterUserId
      );
      res.status(200).json({ ...result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the profesor details", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to create a recommendation
   * @param req
   * @param res
   * @returns
   *  */
  public static async createRecommendation(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const documentId = req.params.documentId;
      const courseId = req.params.courseId;
      const result = await UsersDao.createRecommendation(
        documentId,
        courseId,
        requesterUserId
      );

      const emails = await CoursesDao.getCourseEmails(
        courseId,
        requesterUserId
      );

      let allSent = true;

      for (const { courseName, studentEmail } of emails) {
        try {
          const answer = await sendNotificationNewRecommendation(
            studentEmail,
            courseName
          );
          if (!answer) {
            console.warn(`No se pudo enviar correo a ${studentEmail}`);
            allSent = false;
          }
        } catch (error) {
          console.error(`Error al enviar a ${studentEmail}:`, error);
          allSent = false;
        }
      }

      if (!allSent) {
        res.status(400).json({ result: "notification_error" });
        return;
      }

      res.status(200).json({ lastNotificationId: result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error creating a recommendation", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  public static async getProfesorsActivity(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const professorId = req.params.professorId;

      const result = await UsersDao.getProfesorsActivity(requesterUserId, professorId);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the professor activity", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  public static async getStudentsMetrics(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const courseId = req.params.courseId;

      const result = await UsersDao.getStudentsMetrics(
        requesterUserId,
        courseId
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the students metrics", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to get the professor details
   * @param req
   * @param res
   */
  /*
  public static async selectCourseNotifications(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const courseId = req.params.courseId;
      const requesterUserId = req.user.userId;

      const result = await UsersDao.selectCourseNotifications(
        courseId,
        requesterUserId
      );
      res.status(200).json({ ...result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the Course Notifications", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }*/
}
