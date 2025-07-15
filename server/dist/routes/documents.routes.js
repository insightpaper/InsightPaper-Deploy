"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_1 = __importDefault(require("../controllers/document"));
const router = (0, express_1.Router)();
router.get("/studentDocuments", document_1.default.getStudentDocuments);
router.get("/topFiveStudentDocuments", document_1.default.getTopStudentDocuments);
router.post("/studentDocument", document_1.default.createStudentDocument);
router.put("/studentDocuments/:documentId", document_1.default.updateStudentDocuments);
router.delete("/studentDocuments/:documentId", document_1.default.deleteStudentDocument);
router.delete("/deleteDocument/:courseId/:documentId", document_1.default.deleteDocument);
exports.default = router;
