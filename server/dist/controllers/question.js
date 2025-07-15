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
const axios_1 = __importDefault(require("axios"));
const exceljs_1 = __importDefault(require("exceljs"));
const question_1 = __importDefault(require("../daos/question"));
const document_1 = __importDefault(require("../daos/document"));
const AxiosInstance_1 = require("../services/AxiosInstance");
class QuestionController {
    /**
     * Function to search
     * @param req
     * @param res
     */
    static gptSearch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const courseId = req.params.courseId;
                const { question, documentsNumber } = req.body;
                if (!question) {
                    throw new ValidationError_1.ValidationError("Question is required");
                }
                const response = yield AxiosInstance_1.axiosInstance.post("gptSearch/", {
                    question,
                    courseId,
                    documentsNumber,
                });
                const matches = response.data.matches;
                const documentIds = matches.map((match) => match.documentId);
                const results = yield Promise.all(documentIds.map((id) => document_1.default.getDocumentById(id, requesterUserId).catch((error) => {
                    console.error(`Error getting document:`, error);
                    res.status(500).json({ error: "Error getting document" });
                })));
                const documents = results.filter((doc) => doc !== null);
                res.status(200).json({ documents: documents.flat() });
            }
            catch (error) {
                console.log(error);
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else if (axios_1.default.isAxiosError(error)) {
                    res.status(500).json({ error: "gpt_search_error" });
                }
                else {
                    console.error("Error searching", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to do a full context search
     * @param req
     * @param res
     */
    static gptFullContext(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const courseId = req.params.courseId;
                const { question } = req.body;
                console.log("Iniciando busqueda");
                if (!question) {
                    throw new ValidationError_1.ValidationError("Question is required");
                }
                const documents = yield document_1.default.getDocuments(courseId, requesterUserId);
                const response = yield AxiosInstance_1.axiosInstance.post("gptContext/", {
                    question,
                    documents: documents.documents,
                });
                const parsed = JSON.parse(response.data.gptResponse);
                const documentIds = Array.isArray(parsed.ids)
                    ? parsed.ids
                    : typeof parsed.ids === "string"
                        ? [parsed.ids]
                        : [];
                const results = yield Promise.all(documentIds.map((id) => document_1.default.getDocumentById(id, requesterUserId).catch((error) => {
                    console.error(`Error getting document`, error);
                    return null;
                })));
                // Lo que hace esta linea es aplanar el arreglo y luego filtrar los valores nulos
                const flatResults = results.flat().filter(Boolean);
                // Cuando ocurre un error, el array sin nulos es mas pequeño que el original
                // por lo que si no son iguales, significa que hubo un error
                if (flatResults.length != results.length) {
                    res.status(500).json({ error: "unexpected_error" });
                    return;
                }
                const foundDocuments = results.filter((doc) => doc !== null);
                res.status(200).json({
                    documents: foundDocuments.flat(),
                });
            }
            catch (error) {
                console.log(error);
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else if (axios_1.default.isAxiosError(error)) {
                    res.status(500).json({ error: "gpt_search_error" });
                }
                else {
                    console.error("Error searching", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to post a question
     * @param req
     * @param res
     */
    static postQuestionLLM(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documentId = req.params.documentId;
                const requesterUserId = req.user.userId;
                const { question, model } = req.body;
                if (!question) {
                    throw new ValidationError_1.ValidationError("Question is required");
                }
                const chatHistory = yield question_1.default.getHistory(documentId, requesterUserId);
                const response = yield AxiosInstance_1.axiosInstance.post("llm/", {
                    question,
                    provider: model,
                    chatHistory,
                });
                const questionId = yield question_1.default.postQuestion(question, documentId, requesterUserId);
                console.log();
                const ResponseResult = yield question_1.default.postResponse(response.data.answer, questionId, requesterUserId);
                res.status(200).json({ answer: response.data.answer });
            }
            catch (error) {
                console.log(error);
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else if (axios_1.default.isAxiosError(error)) {
                    res.status(500).json({ error: "llm_error" });
                }
                else {
                    console.error("Error posting the question", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to post a question
     * @param req
     * @param res
     */
    static postQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documentId = req.params.documentId;
                const requesterUserId = req.user.userId;
                const { question } = req.body;
                const result = yield question_1.default.postQuestion(question, documentId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error posting the question", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to post a response
     * @param req
     * @param res
     */
    static postResponse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const questionId = req.params.questionId;
                const requesterUserId = req.user.userId;
                const { response } = req.body;
                const result = yield question_1.default.postResponse(response, questionId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error posting the response", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get the history of questions
     * @param req
     * @param res
     */
    static getHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documentId = req.params.documentId;
                const requesterUserId = req.user.userId;
                const result = yield question_1.default.getHistory(documentId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the history of questions", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    static getChat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const documentId = req.params.documentId;
                const userId = req.params.studentId;
                const requesterUserId = req.user.userId;
                const result = yield question_1.default.getStudentChat(documentId, userId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    console.error("Error getting the history of questions", error);
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the history of questions", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    static downloadHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { documentId, studentId } = req.params;
                const requesterUserId = req.user.userId;
                let history;
                if (studentId) {
                    history = yield question_1.default.getStudentHistory(documentId, studentId, requesterUserId);
                }
                else {
                    history = yield question_1.default.getHistory(documentId, requesterUserId);
                }
                const workbook = new exceljs_1.default.Workbook();
                const worksheet = workbook.addWorksheet("Historial");
                worksheet.columns = [
                    { header: "Pregunta", key: "question", width: 60 },
                    { header: "Respuesta", key: "response", width: 60 },
                    { header: "Evaluación", key: "evaluation", width: 15 },
                    { header: "Fecha Pregunta", key: "questionCreatedDate", width: 20 },
                    { header: "Fecha Respuesta", key: "responseCreatedDate", width: 20 },
                ];
                history.forEach((entry) => {
                    worksheet.addRow({
                        question: entry.question,
                        response: entry.response,
                        evaluation: entry.evaluation,
                        questionCreatedDate: entry.questionCreatedDate,
                        responseCreatedDate: entry.responseCreatedDate,
                    });
                });
                res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                res.setHeader("Content-Disposition", "attachment; filename=historial-chat.xlsx");
                yield workbook.xlsx.write(res);
                res.end();
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the history of questions", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get the history of questions
     * @param req
     * @param res
     */
    static getStudentChats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId, studentId } = req.params;
                const requesterUserId = req.user.userId;
                const result = yield question_1.default.getStudentChats(studentId, courseId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the history of questions", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to evaluate a question
     * @param req
     * @param res
     */
    static evaluateQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const questionId = req.params.questionId;
                const requesterUserId = req.user.userId;
                const { evaluation } = req.body;
                const result = yield question_1.default.evaluateQuestion(evaluation, questionId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error evaluating the question", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to post a comment
     * @param req
     * @param res
     */
    static postComment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const questionId = req.params.questionId;
                const requesterUserId = req.user.userId;
                const { comment, isPrivate } = req.body;
                const result = yield question_1.default.postComment(comment, questionId, requesterUserId, isPrivate);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error posting the comment", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
}
exports.default = QuestionController;
