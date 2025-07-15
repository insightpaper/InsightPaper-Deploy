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
const document_1 = __importDefault(require("../daos/document"));
const course_1 = __importDefault(require("../daos/course"));
const emailService_1 = require("../services/emailService");
const AxiosInstance_1 = require("../services/AxiosInstance");
class DocumentsController {
    /**
     * Function to get a documents by id
     * @param req
     * @param res
     * @returns
     *  */
    static getDocuments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const { pageNumber, pageSize, orderBy, orderDirection } = req.query;
                const result = yield document_1.default.getDocuments(req.params.courseId, requesterUserId, Number(pageNumber), Number(pageSize), orderBy, orderDirection);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the courses documents", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to Delete a document
     * @param req
     * @param res
     */
    static deleteDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const documentId = req.params.documentId;
                const courseId = req.params.courseId;
                const result = yield document_1.default.deleteDocument(documentId, requesterUserId);
                const resultSearch = yield AxiosInstance_1.axiosInstance.post("deleteDocumentPinecone/", {
                    documentId,
                    courseId,
                });
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error deleting document", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get the history
     * @param req
     * @param res
     * @returns
     *  */
    static getHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield document_1.default.getHistory(req.params.documentId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the history", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to update a document
     * @param req
     * @param res
     * @returns
     *  */
    static updateDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const { documentId, title, description, labels, firebaseUrl } = req.body;
                const result = yield document_1.default.updateDocument(documentId, title, description, labels, firebaseUrl, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error updating a document", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to create a document
     * @param req
     * @param res
     * @returns
     *  */
    static createDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const { courseId, title, description, labels, firebaseUrl } = req.body;
                const documentId = yield document_1.default.createDocument(title, description, labels, firebaseUrl, courseId, requesterUserId);
                const resultSearch = yield AxiosInstance_1.axiosInstance.post("addDocumentPinecone/", {
                    documentId,
                    title,
                    description,
                    labels,
                    firebaseUrl,
                    courseId,
                });
                const emails = yield course_1.default.getCourseEmails(courseId, requesterUserId);
                let allSent = true;
                for (const { courseName, studentEmail } of emails) {
                    try {
                        const answer = yield (0, emailService_1.sendNotificationNewDocument)(studentEmail, courseName);
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
                res.status(200).json({ documentId });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error creating a document", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get a documents by id
     * @param req
     * @param res
     * @returns
     *  */
    static getDocumentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield document_1.default.getDocumentById(req.params.documentId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting documents by id", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get the student documents
     * @param req
     * @param res
     * @returns
     *  */
    static getStudentDocuments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield document_1.default.getStudentDocuments(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the student documents", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get the student top five last created documents
     * @param req
     * @param res
     * @returns
     *  */
    static getTopStudentDocuments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield document_1.default.getTopStudentDocuments(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the student top five documents", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to create a student document
     * @param req
     * @param res
     * @returns
     *  */
    static createStudentDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const { title, description, labels, firebaseUrl } = req.body;
                const result = yield document_1.default.createStudentDocument(title, description, labels, firebaseUrl, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error creating a student document", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to update a personal document
     * @param req
     * @param res
     * @returns
     *  */
    static updateStudentDocuments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const documentId = req.params.documentId;
                const { title, description, labels } = req.body;
                const result = yield document_1.default.updateStudentDocuments(documentId, title, description, labels, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error updating the personal document", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to Delete a student document
     * @param req
     * @param res
     */
    static deleteStudentDocument(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const documentId = req.params.documentId;
                const result = yield document_1.default.deleteStudentDocument(documentId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error deleting document", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
}
exports.default = DocumentsController;
