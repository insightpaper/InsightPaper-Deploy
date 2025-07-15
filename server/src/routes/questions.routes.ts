import { Router } from "express";
import QuestionController from "../controllers/question";

const router = Router();

router.get("/:documentId", QuestionController.getHistory);
router.get("/downloadHistory/:documentId", QuestionController.downloadHistory);
router.get("/downloadHistory/:documentId/student/:studentId", QuestionController.downloadHistory);
router.get("/chats/:courseId/student/:studentId", QuestionController.getStudentChats);
router.get("/chat/:documentId/student/:studentId", QuestionController.getChat);

router.post("/chat/:documentId", QuestionController.postQuestionLLM);
router.post("/gptSearch/:courseId", QuestionController.gptSearch);
router.post("/gptFullContext/:courseId", QuestionController.gptFullContext);
router.post("/response/:questionId", QuestionController.postResponse);
router.post("/comment/:questionId", QuestionController.postComment);

router.put("/:questionId", QuestionController.evaluateQuestion);

export default router;