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
Object.defineProperty(exports, "__esModule", { value: true });
const databaseService_1 = require("../services/databaseService");
const jsonParser_1 = require("../utils/jsonParser");
class QuestionDao {
    /**
     * Function to post a question
     * @param question Pregunta realizada
     * @param documentId ID del documento
     * @param currentUserId ID del usuario activo
     * @returns question id
     */
    static postQuestion(question, documentId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Questions_CreateQuestion", {
                IN_question: question,
                IN_documentId: documentId,
                IN_currentUserId: currentUserId,
            });
            return result[0][0].affectedEntityId;
        });
    }
    /**
     * Function to post a response
     * @param response Pregunta realizada
     * @param questionId ID de la pregunta
     * @param currentUserId ID del usuario activo
     * @returns reponse id
     */
    static postResponse(response, questionId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Questions_CreateResponse", {
                IN_response: response,
                IN_questionId: questionId,
                IN_currentUserId: currentUserId,
            });
            return result[0][0].affectedEntityId;
        });
    }
    /**
     * Function to get the history of questions
     * @param documentId Id of the document
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getHistory(documentId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Questions_GetHistory", {
                IN_documentId: documentId,
                IN_currentUserId: currentUserId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            if (!jsonString || jsonString.trim() === "") {
                return [];
            }
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    static getStudentHistory(documentId, studentId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)('SP_Questions_GetStudentHistory', {
                IN_documentId: documentId,
                IN_studentId: studentId,
                IN_currentUserId: currentUserId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            if (!jsonString || jsonString.trim() === "") {
                return [];
            }
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    static getStudentChat(documentId, studentId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Questions_GetStudentSingleChat", {
                IN_currentUserId: currentUserId,
                IN_studentId: studentId,
                IN_documentId: documentId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            if (!jsonString || jsonString.trim() === "") {
                return [];
            }
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    /**
     * Function to get the chats history
     * @param courseId Id of the course
     * @param studentId Id of the student
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getStudentChats(studentId, courseId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Questions_GetStudentChats", {
                IN_courseId: courseId,
                IN_studentId: studentId,
                IN_currentUserId: currentUserId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            if (!jsonString || jsonString.trim() === "") {
                return [];
            }
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    /**
     * Function to post a response
     * @param response Pregunta realizada
     * @param questionId ID de la pregunta
     * @param currentUserId ID del usuario activo
     * @returns reponse id
     */
    static evaluateQuestion(evaluation, questionId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Questions_EvaluateQuestion", {
                IN_evaluation: evaluation,
                IN_questionId: questionId,
                IN_currentUserId: currentUserId,
            });
            return result[0][0].affectedEntityId;
        });
    }
    /**
     * Function to post a response
     * @param response Pregunta realizada
     * @param questionId ID de la pregunta
     * @param currentUserId ID del usuario activo
     * @returns reponse id
     */
    static postComment(comment, questionId, currentUserId, isPrivate) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Questions_CreateComment", {
                IN_comment: comment,
                IN_currentUserId: currentUserId,
                IN_questionId: questionId,
                IN_isPrivate: isPrivate,
            });
            return result[0][0].affectedEntityId;
        });
    }
}
exports.default = QuestionDao;
