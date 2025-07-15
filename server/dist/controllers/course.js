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
const course_1 = __importDefault(require("../daos/course"));
class CoursesController {
    /**
     * Function to get all courses
     * @param req
     * @param res
     */
    static getAllCourses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.getAllCourses(Number(req.query.pageNumber), Number(req.query.pageSize), req.query.filter, req.query.orderBy, req.query.orderDirection, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting all courses", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get a course by id
     * @param req
     * @param res
     * @returns
     *  */
    static getCourseById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.getCourseById(req.params.courseId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting course by id", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to create a course
     * @param req
     * @param res
     */
    static createCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const { name, description, semester } = req.body;
                const result = yield course_1.default.createCourse(name, description, semester, requesterUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error creating course", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to Join a course
     * @param req
     * @param res
     */
    static JoinCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const { courseCode } = req.body;
                const result = yield course_1.default.JoinCourse(courseCode, requesterUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error joining course", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to Leave a course
     * @param req
     * @param res
     */
    static LeaveCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.LeaveCourse(req.params.courseId, requesterUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error leaving course", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to remove a student from a course
     * @param req
     * @param res
     */
    static RemoveStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.RemoveStudent(req.params.courseId, requesterUserId, req.body.studentId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error leaving course", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get a course of a professor
     * @param req
     * @param res
     * @returns
     *  */
    static getCoursesProfessor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.getCoursesProfessor(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting professor courses", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get a course of a student
     * @param req
     * @param res
     * @returns
     *  */
    static getCoursesStudent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.getCoursesStudent(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting student courses", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to get a course of a student
     * @param req
     * @param res
     * @returns
     *  */
    static getStudentActivityCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.getStudentActivityCourse(requesterUserId, req.params.courseId, req.params.studentId);
                res.status(200).json(Object.assign({}, result));
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting student activity course", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to update a course
     * @param req
     * @param res
     */
    static updateCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const { name, description, semester, courseId } = req.body;
                const result = yield course_1.default.updateCourse(name, description, semester, requesterUserId, courseId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error updating course", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to Delete a course
     * @param req
     * @param res
     */
    static deleteCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.deleteCourse(req.params.courseId, requesterUserId, req.ip, req.headers["user-agent"]);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error deleting course", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    static getStudentByCourses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.getStudentByCourses(req.params.courseId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the list of students by course", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    static getStudentByProfessor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield course_1.default.getStudentByProfessor(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the list of students by professor", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
}
exports.default = CoursesController;
