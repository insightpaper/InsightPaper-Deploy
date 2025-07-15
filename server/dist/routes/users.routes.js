"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = __importDefault(require("../controllers/user"));
const router = (0, express_1.Router)();
// Authentication routes
router.post("/authenticate-token", user_1.default.authenticateToken);
router.post("/refresh", user_1.default.refreshToken);
router.post("/login", user_1.default.login);
router.post("/log-out", user_1.default.logout);
// User routes
router.get("/", user_1.default.getAllUsers);
router.get("/id/:userId", user_1.default.getUserById);
router.get("/allStudents", user_1.default.getStudents);
router.get("/professorDetails/:userId", user_1.default.getProfessorDetails);
router.get("/profesorsActivity/:professorId", user_1.default.getProfesorsActivity);
router.get("/studentsMetrics/:courseId", user_1.default.getStudentsMetrics);
//router.get("/selectCourseNotifications/:courseId", UsersController.selectCourseNotifications);
router.put("/enable-otp/:userId", user_1.default.enableOtpAuthApp);
router.put("/disable-otp/:userId", user_1.default.disableOtpAuthApp);
router.put("/update", user_1.default.updateUser);
router.put("/change-my-password", user_1.default.authenticateOtp, user_1.default.changeMyPassword);
router.put("/change-password/:userId", user_1.default.changePassword);
router.put("/update-roles/:userId", user_1.default.updateUserRoles);
router.post("/request-password-recovery", user_1.default.requestPasswordRecovery);
router.post("/confirm-password-recovery", user_1.default.confirmPasswordRecovery);
router.post("/send-otp", user_1.default.sendOtp);
router.post("/verify-otp", user_1.default.authenticateOtp, user_1.default.verifyLoginOtp);
router.post("/confirm-otp/:userId", user_1.default.confirmOtpActivation);
router.delete("/:userId", user_1.default.deleteUser);
router.delete("/professor/:userId", user_1.default.deleteProfessor);
router.delete("/account/current", user_1.default.deleteAccount);
router.post("/student/create-user", user_1.default.createStudentUser);
// Admin routes
router.post("/admin/create-user", user_1.default.createAdminUser);
// Professor routes
router.post("/professor/create-user", user_1.default.createProfessorUser);
router.post("/recommendation/:courseId/:documentId", user_1.default.createRecommendation);
exports.default = router;
