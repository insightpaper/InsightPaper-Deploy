import { Router } from "express";
import DocumentController from "../controllers/document";

const router = Router();

router.get("/studentDocuments", DocumentController.getStudentDocuments);
router.get("/topFiveStudentDocuments", DocumentController.getTopStudentDocuments);

router.post("/studentDocument", DocumentController.createStudentDocument);

router.put("/studentDocuments/:documentId", DocumentController.updateStudentDocuments);

router.delete("/studentDocuments/:documentId", DocumentController.deleteStudentDocument);
router.delete("/deleteDocument/:courseId/:documentId", DocumentController.deleteDocument);

export default router;
