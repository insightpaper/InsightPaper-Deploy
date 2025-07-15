import { Router } from "express";
import CourseController from "../controllers/course";
import DocumentController from "../controllers/document";

const router = Router();

router.get("/", CourseController.getAllCourses);
router.get("/Id/:courseId", CourseController.getCourseById);
router.get("/Professor", CourseController.getCoursesProfessor);
router.get("/Student", CourseController.getCoursesStudent);
router.get("/courseStudents/:courseId", CourseController.getStudentByCourses);
router.get("/professorStudents", CourseController.getStudentByProfessor);
router.get("/documents/:courseId", DocumentController.getDocuments);
router.get("/history/:documentId", DocumentController.getHistory);
router.get("/documentsId/:documentId", DocumentController.getDocumentById);
router.get("/studentActivity/:studentId/:courseId", CourseController.getStudentActivityCourse);

router.post("/", CourseController.createCourse);
router.post("/joinCourse", CourseController.JoinCourse);
router.post("/documents", DocumentController.createDocument);

router.put("/leaveCourse/:courseId", CourseController.LeaveCourse);
router.put("/removeStudent/:courseId", CourseController.RemoveStudent);
router.put("/", CourseController.updateCourse);
router.put("/documents", DocumentController.updateDocument);

router.delete("/:courseId", CourseController.deleteCourse);

export default router;
