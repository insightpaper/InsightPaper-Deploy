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
     * Function to get all courses
     * @param pageNumber Actual page number
     * @param pageSize Page size
     * @param filter Filter by [name, email, phone, city, country]
     * @param orderBy Order by [name, email, phone, city, country]
     * @param orderDirection Order direction [ASC, DESC]
     * @param currentUserId Current user ID
     * @returns
     */
    static getAllCourses(pageNumber, pageSize, filter, orderBy, orderDirection, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_GetCourses", {
                IN_pageNumber: pageNumber,
                IN_pageSize: pageSize,
                IN_filter: filter,
                IN_orderBy: orderBy,
                IN_orderDirection: orderDirection,
                IN_currentUserId: currentUserId,
            });
            if (result.length === 0 || result[0].length === 0) {
                // Return an empty array if no courses are found
                return { courses: [], totalPages: 0 };
            }
            // Extract the course data from the result
            const coursesData = result[0]; // First array contains the course data
            const totalPages = result[1][0].totalPages; // Second array contains metadata
            // Parse the roles field and map to UserInterface
            const courses = coursesData.map((course) => (Object.assign({}, course)));
            return { courses, totalPages };
        });
    }
    /**
     * Function to create a new course in the database
     * @param name
     * @param description
     * @param semester
     * @param code
     * @param currentUserId
     * @returns userId
     */
    static createCourse(name, description, semester, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_CreateCourse", {
                IN_name: name,
                IN_description: description,
                IN_semester: semester,
                IN_currentUserId: currentUserId,
            });
            return result[0][0].courseCode;
        });
    }
    /**
     * Function to get course by id
     * @param course Course object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getCourseById(courseId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_GetCourseById", {
                IN_courseId: courseId,
                IN_currentUserId: currentUserId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    /**
     * Function to users join a course
     * @param course Course object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static JoinCourse(courseCode, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_JoinCourse", {
                IN_courseCode: courseCode,
                IN_currentUserId: currentUserId,
            });
            return result[0].length > 0;
        });
    }
    /**
     * Function to users leave a course
     * @param course Course object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static LeaveCourse(courseId, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_LeaveCourse", {
                IN_courseId: courseId,
                IN_currentUserId: currentUserId,
            });
            return result[0].length > 0;
        });
    }
    /**
     * @param course Course object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static RemoveStudent(courseId, currentUserId, studentId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_RemoveStudent", {
                IN_courseId: courseId,
                IN_currentUserId: currentUserId,
                IN_studentId: studentId,
            });
            return result[0].length > 0;
        });
    }
    /**
     * Function to get the courses of the professor
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getCoursesProfessor(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_GetCoursesProfessor", {
                IN_currentUserId: currentUserId,
            });
            if (result.length === 0 || result[0].length === 0) {
                return { data: [] };
            }
            const rawJson = result[0][0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"];
            if (!rawJson)
                return { data: [] };
            const parsed = JSON.parse(rawJson);
            return { data: parsed };
        });
    }
    /**
     * Function to get the courses of the student
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getCoursesStudent(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_GetCoursesStudent", {
                IN_currentUserId: currentUserId,
            });
            if (result.length === 0 || result[0].length === 0) {
                return { data: [] };
            }
            const rawJson = result[0][0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"];
            if (!rawJson)
                return { data: [] };
            const parsed = JSON.parse(rawJson);
            return { data: parsed };
        });
    }
    /**
     *
     * @param currentUserId
     * @param courseId
     * @param studentId
     * @returns
     */
    static getStudentActivityCourse(currentUserId, courseId, studentId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetStudentActivity", {
                IN_courseId: courseId,
                IN_currentUserId: currentUserId,
                IN_studentId: studentId,
            });
            const [generalStatsRow, documentsStatsRow, activityTimelineRow] = result;
            const generalStats = (_a = JSON.parse(generalStatsRow[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"]).generalStats[0]) !== null && _a !== void 0 ? _a : {};
            const documentsStats = (_b = JSON.parse(documentsStatsRow[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"]).documentsStats) !== null && _b !== void 0 ? _b : [];
            const activityTimeline = (_c = JSON.parse(activityTimelineRow[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"]).activityTimeline) !== null && _c !== void 0 ? _c : [];
            return {
                generalStats,
                documentsStats,
                activityTimeline,
            };
        });
    }
    /**
     * Function to update a new course in the database
     * @param name
     * @param description
     * @param semester
     * @param courseCode
     * @param currentUserId
     * @returns userId
     */
    static updateCourse(name, description, semester, currentUserId, courseId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_UpdateCourse", {
                IN_name: name,
                IN_description: description,
                IN_semester: semester,
                IN_currentUserId: currentUserId,
                IN_courseId: courseId,
            });
            console.log(result);
            return result[0][0].userId;
        });
    }
    /**
     * Function to delete a new course in the database
     * @param course Course object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static deleteCourse(courseId, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_DeleteCourse", {
                IN_courseId: courseId,
                IN_currentUserId: currentUserId,
            });
            return result[0].length > 0;
        });
    }
    /**
     * Function to get students by id
     * @param course Course object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getStudentByCourses(courseId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetStudentsByCourse", {
                IN_courseId: courseId,
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
     * Function to get students by id
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getStudentByProfessor(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetStudentsByProfessor", {
                IN_currentUserId: currentUserId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    /**
   * Function to get students emails
   * @param course Course object with the new data
   * @param currentUserId Current user ID
   * @returns Boolean
   */
    static getCourseEmails(courseId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Courses_GetCourseEmails", {
                IN_courseId: courseId,
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
}
exports.default = CoursesDao;
