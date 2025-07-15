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
/**
 * Class to handle the course data
 */
class CoursesDao {
    /**
     * Function to get documents
     * @param course Course object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getDocuments(courseId_1, currentUserId_1) {
        return __awaiter(this, arguments, void 0, function* (courseId, currentUserId, pageNumber = 1, pageSize = 10, orderBy = "createdDate", orderDirection = "ASC") {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_GetDocuments", {
                IN_courseId: courseId,
                IN_currentUserId: currentUserId,
                IN_pageNumber: pageNumber,
                IN_pageSize: pageSize,
                IN_orderBy: orderBy,
                IN_orderDirection: orderDirection,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            if (!jsonString || jsonString.trim() === "") {
                return { documents: [], totalCount: 0 };
            }
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    /**
     * Function to delete a new document in the database
     * @param document document object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static deleteDocument(documentId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_DeleteDocument", {
                IN_documentId: documentId,
                IN_currentUserId: currentUserId,
            });
            return result[0].length > 0;
        });
    }
    /**
     * Function to get the history
     * @param documentId Document object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getHistory(documentId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_GetHistory", {
                IN_documentId: documentId,
                IN_currentUserId: currentUserId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    /**
     * Function to update a document
     * @param documentId Document object with the new data
     * @param title Document title
     * @param description Document description
     * @param labels Document labels
     * @param firebaseUrl Firebase url to the document
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static updateDocument(documentId, title, description, labels, firebaseUrl, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_UpdateDocument", {
                IN_documentId: documentId,
                IN_title: title,
                IN_description: description,
                IN_labels: labels,
                IN_currentUserId: currentUserId,
            });
            // Recuerden que no siempre viene el resultado
            if (!result || result.length === 0) {
                return false;
            }
            return result[0].length > 0;
        });
    }
    /**
     * Function to create a document
     * @param courseId Course object with the new data
     * @param title Document title
     * @param description Document description
     * @param labels Document labels
     * @param firebaseUrl Firebase url to the document
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static createDocument(title, description, labels, firebaseUrl, courseId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_CreateDocument", {
                IN_title: title,
                IN_description: description,
                IN_labels: labels,
                IN_firebaseUrl: firebaseUrl,
                IN_currentUserId: currentUserId,
                IN_courseId: courseId,
            });
            return result[0][0].affectedEntityId;
        });
    }
    /**
     * Function to get documents
     * @param documentId documentId object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getDocumentById(documentId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_GetDocumentById", {
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
    /**
     * Function to get students documents
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getStudentDocuments(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_GetStudentDocuments", {
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
     * Function to get the student top five last created documents
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getTopStudentDocuments(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_GetTopFiveStudentDocuments", {
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
     * Function to create a student document
     * @param courseId Course object with the new data
     * @param title Document title
     * @param description Document description
     * @param labels Document labels
     * @param firebaseUrl Firebase url to the document
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static createStudentDocument(title, description, labels, firebaseUrl, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_CreateStudentDocument", {
                IN_title: title,
                IN_description: description,
                IN_labels: labels,
                IN_firebaseUrl: firebaseUrl,
                IN_currentUserId: currentUserId,
            });
            return result[0][0].affectedEntityId;
        });
    }
    /**
     * Function to update a personal document
     * @param documentId Document object with the new data
     * @param title Document title
     * @param description Document description
     * @param labels Document labels
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static updateStudentDocuments(documentId, title, description, labels, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_UpdateStudentDocument", {
                IN_documentId: documentId,
                IN_title: title,
                IN_description: description,
                IN_labels: labels,
                IN_currentUserId: currentUserId,
            });
            // Recuerden que no siempre viene el resultado
            if (!result || result.length === 0) {
                return false;
            }
            return result[0][0].affectedEntityId;
        });
    }
    /**
     * Function to delete a student personal document in the database
     * @param document document object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static deleteStudentDocument(documentId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Documents_DeleteStudentDocument", {
                IN_documentId: documentId,
                IN_currentUserId: currentUserId,
            });
            return result[0][0].affectedEntityId;
        });
    }
}
exports.default = CoursesDao;
