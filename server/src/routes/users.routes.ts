import { Router } from "express";
import UsersController from "../controllers/user";

const router = Router();

// Authentication routes
router.post("/authenticate-token", UsersController.authenticateToken);
router.post("/refresh", UsersController.refreshToken);
router.post("/login", UsersController.login);
router.post("/log-out", UsersController.logout);

// User routes

router.get("/", UsersController.getAllUsers);
router.get("/id/:userId", UsersController.getUserById);
router.get("/allStudents", UsersController.getStudents);
router.get("/professorDetails/:userId", UsersController.getProfessorDetails);
router.get("/profesorsActivity/:professorId", UsersController.getProfesorsActivity);
router.get("/studentsMetrics/:courseId", UsersController.getStudentsMetrics);
//router.get("/selectCourseNotifications/:courseId", UsersController.selectCourseNotifications);

router.put("/enable-otp/:userId", UsersController.enableOtpAuthApp);
router.put("/disable-otp/:userId", UsersController.disableOtpAuthApp);
router.put("/update", UsersController.updateUser);
router.put(
  "/change-my-password",
  UsersController.authenticateOtp,
  UsersController.changeMyPassword
);
router.put("/change-password/:userId", UsersController.changePassword);
router.put("/update-roles/:userId", UsersController.updateUserRoles);

router.post(
  "/request-password-recovery",
  UsersController.requestPasswordRecovery
);
router.post(
  "/confirm-password-recovery",
  UsersController.confirmPasswordRecovery
);
router.post("/send-otp", UsersController.sendOtp);
router.post(
  "/verify-otp",
  UsersController.authenticateOtp,
  UsersController.verifyLoginOtp
);
router.post("/confirm-otp/:userId", UsersController.confirmOtpActivation);
router.delete("/:userId", UsersController.deleteUser);
router.delete("/professor/:userId", UsersController.deleteProfessor);
router.delete("/account/current", UsersController.deleteAccount);

router.post("/student/create-user", UsersController.createStudentUser);

// Admin routes
router.post("/admin/create-user", UsersController.createAdminUser);

// Professor routes
router.post("/professor/create-user", UsersController.createProfessorUser);
router.post(
  "/recommendation/:courseId/:documentId",
  UsersController.createRecommendation
);

export default router;
