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
const mssql_1 = require("mssql");
/**
 * Class to handle the user data
 */
class UsersDao {
    /**
     * Function to get all users
     * @param pageNumber Actual page number
     * @param pageSize Page size
     * @param filter Filter by [name, email, phone, city, country]
     * @param orderBy Order by [name, email, phone, city, country]
     * @param orderDirection Order direction [ASC, DESC]
     * @param role Role filter [Admin, Creator, Brand]
     * @param currentUserId Current user ID
     * @returns
     */
    static getAllUsers(pageNumber, pageSize, filter, orderBy, orderDirection, roles, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const rolesTable = new mssql_1.Table("StringListType");
            rolesTable.columns.add("value", mssql_1.NVarChar, { nullable: false });
            roles === null || roles === void 0 ? void 0 : roles.forEach((role) => {
                rolesTable.rows.add(role);
            });
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetUsers", {
                IN_pageNumber: pageNumber,
                IN_pageSize: pageSize,
                IN_filter: filter,
                IN_orderBy: orderBy,
                IN_orderDirection: orderDirection,
                IN_roles: rolesTable,
                IN_currentUserId: currentUserId,
            });
            if (result.length === 0 || result[0].length === 0) {
                // Return an empty array if no users are found
                return { users: [], totalPages: 0 };
            }
            // Extract the user data from the result
            const usersData = result[0]; // First array contains the user data
            const totalPages = result[1][0].totalPages; // Second array contains metadata
            // Parse the roles field and map to UserInterface
            const users = usersData.map((user) => (Object.assign(Object.assign({}, user), { doubleFactorEnabled: user.doubleFactorEnabled || false, passwordChanged: user.passwordChanged || false, roles: JSON.parse(user.roles) })));
            return { users, totalPages };
        });
    }
    /**
     * Function to get a user by email
     * @param email
     * @returns The user object
     */
    static getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetUserByEmail", {
                IN_email: email,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    /**
     * Function to get a user by ID
     * @param userId
     * @param currentUserId
     * @returns
     */
    static getUserById(userId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetUserById", {
                IN_userId: userId,
                IN_currentUserId: currentUserId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    /**
     * Gets the user otp by email
     * @param email
     * @returns The users object
     */
    static getUserOtpByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetUserOtpByEmail", {
                IN_email: email,
            });
            return result[0][0];
        });
    }
    /**
     * Function update the user otp by email
     * @param email
     * @param securityCode
     * @param securityCodeExpiration
     * @returns The user object
     */
    static updateUserOtpByEmail(email, securityCode, securityCodeExpiration) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_UpdateUserOtpByEmail", {
                IN_email: email,
                IN_securityCode: securityCode,
                IN_securityCodeExpiration: securityCodeExpiration,
            });
            return result[0].length > 0;
        });
    }
    /**
     * Function to invalidate the user otp by email
     * @param email
     * @returns Boolean
     */
    static invalidateUserOtpByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_InvalidateUserOtpByEmail", {
                IN_email: email,
            });
            return result[0].length > 0;
        });
    }
    /**
     * Update the user password
     * @param email
     * @param newPassword
     * @param currentUserId
     * @returns Boolean
     */
    static updateUserPassword(userId, newPassword, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_UpdateUserPassword",
                    params: {
                        IN_userId: userId,
                        IN_password: newPassword,
                        IN_currentUserId: currentUserId,
                    },
                },
                {
                    name: "SP_SystemLog_CreateLog",
                    params: {
                        IN_userId: currentUserId,
                        IN_affectedEntity: "Users",
                        IN_ipAddress: ipAddress,
                        IN_userAgent: userAgent,
                    },
                },
            ]);
            return result[0][0].IN_affectedEntity !== null;
        });
    }
    /**
     * Function to create a new user in the database
     * @param name
     * @param email
     * @param password
     * @param currentUserId
     * @returns userId
     */
    static createAdminUser(name, email, password, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_CreateAdminUser",
                    params: {
                        IN_name: name,
                        IN_email: email,
                        IN_password: password,
                        IN_currentUserId: currentUserId,
                    },
                },
                {
                    name: "SP_SystemLog_CreateLog",
                    params: {
                        IN_userId: currentUserId,
                        IN_affectedEntity: "Users",
                        IN_ipAddress: ipAddress,
                        IN_userAgent: userAgent,
                    },
                },
            ]);
            return result[0].length > 0;
        });
    }
    /**
     * Function to create a new professor in the database
     * @param name
     * @param email
     * @param password
     * @param currentUserId
     * @returns userId
     */
    static createProfessorUser(name, email, password, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_CreateProfessorUser",
                    params: {
                        IN_name: name,
                        IN_email: email,
                        IN_password: password,
                        IN_currentUserId: currentUserId,
                        IN_securityCode: null,
                        IN_securityCodeExpiration: null,
                    },
                },
                {
                    name: "SP_SystemLog_CreateLog",
                    params: {
                        IN_userId: currentUserId,
                        IN_affectedEntity: "Users",
                        IN_ipAddress: ipAddress,
                        IN_userAgent: userAgent,
                    },
                },
            ]);
            return result[0][0].userId;
        });
    }
    /**
     * Function to create a student user
     * @param userData User basic data
     * @returns String with the new user ID
     */
    static createStudentUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_CreateUser",
                    params: {
                        IN_name: userData.name,
                        IN_email: userData.email,
                        IN_password: userData.password,
                        IN_securityCode: null,
                        IN_securityCodeExpiration: null,
                    },
                },
            ]);
            return result[0][0].userId;
        });
    }
    /**
     * Function to update the user details
     * @param user User object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static updateUser(user, linkToPortfolio, creatorTypes, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const typesTable = new mssql_1.Table("StringListType");
            typesTable.columns.add("value", mssql_1.NVarChar, { nullable: false });
            creatorTypes === null || creatorTypes === void 0 ? void 0 : creatorTypes.forEach((type) => {
                typesTable.rows.add(type.name);
            });
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_UpdateUser",
                    params: {
                        IN_userId: user.userId,
                        IN_name: user.name,
                        IN_email: user.email,
                        IN_password: user.password,
                        IN_pictureUrl: user.pictureUrl,
                        //IN_linkToPortfolio: linkToPortfolio,
                        //IN_creatorTypes: typesTable,
                        IN_securityCode: null,
                        IN_securityCodeExpiration: null,
                        IN_currentUserId: currentUserId,
                    },
                },
                {
                    name: "SP_SystemLog_CreateLog",
                    params: {
                        IN_userId: currentUserId,
                        IN_affectedEntity: "Users",
                        IN_ipAddress: ipAddress,
                        IN_userAgent: userAgent,
                    },
                },
            ]);
            return result[0].length > 0;
        });
    }
    /**
     * Function to delete a user
     * @param userId
     * @param currentUserId
     * @returns Boolean
     */
    static deleteUser(userId, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_DeleteUser",
                    params: {
                        IN_userId: userId,
                        IN_currentUserId: currentUserId,
                    },
                },
                {
                    name: "SP_SystemLog_CreateLog",
                    params: {
                        IN_userId: currentUserId,
                        IN_affectedEntity: "Users",
                        IN_ipAddress: ipAddress,
                        IN_userAgent: userAgent,
                    },
                },
            ]);
            return result[0].length > 0;
        });
    }
    /**
     * Gets the user otp secret by email
     * @param email
     * @returns
     */
    static getUserOtpSecretByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetUserOtpSecretByEmail", {
                IN_email: email,
            });
            return result[0][0].otpSecret;
        });
    }
    /**
     * Updates the user otp secret by email
     * @param userId
     * @param otpSecret
     * @param currentUserId
     * @param ipAddress
     * @param userAgent
     * @returns
     */
    static updateUserOtpSecret(userId, otpSecret, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_UpdateUserOtpSecret",
                    params: {
                        IN_userId: userId,
                        IN_otpSecret: otpSecret,
                        IN_currentUserId: currentUserId,
                    },
                },
                {
                    name: "SP_SystemLog_CreateLog",
                    params: {
                        IN_userId: currentUserId,
                        IN_affectedEntity: "Users",
                        IN_ipAddress: ipAddress,
                        IN_userAgent: userAgent,
                    },
                },
            ]);
            return result[0].length > 0;
        });
    }
    /**
     * Function to disable the otp authentication app
     * @param userId
     * @param currentUserId
     * @param ipAddress
     * @param userAgent
     * @returns
     */
    static disableOtpAuthApp(userId, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_DisableUserOtpSecret",
                    params: {
                        IN_userId: userId,
                        IN_currentUserId: currentUserId,
                    },
                },
                {
                    name: "SP_SystemLog_CreateLog",
                    params: {
                        IN_userId: currentUserId,
                        IN_affectedEntity: "Users",
                        IN_ipAddress: ipAddress,
                        IN_userAgent: userAgent,
                    },
                },
            ]);
            return result[0].length > 0;
        });
    }
    /**
     * Function to enable the otp authentication app
     * @param userId
     * @param currentUserId
     * @param ipAddress
     * @param userAgent
     * @returns
     */
    static enableOtpAuthApp(userId, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_EnableUserOtpSecret",
                    params: {
                        IN_userId: userId,
                        IN_currentUserId: currentUserId,
                    },
                },
                {
                    name: "SP_SystemLog_CreateLog",
                    params: {
                        IN_userId: currentUserId,
                        IN_affectedEntity: "Users",
                        IN_ipAddress: ipAddress,
                        IN_userAgent: userAgent,
                    },
                },
            ]);
            return result[0].length > 0;
        });
    }
    static updateUserRoles(userId, roles, currentUserId, ipAddress, userAgent) {
        return __awaiter(this, void 0, void 0, function* () {
            const rolesTable = new mssql_1.Table("StringListType");
            rolesTable.columns.add("value", mssql_1.NVarChar, { nullable: false });
            roles.forEach((role) => {
                rolesTable.rows.add(role);
            });
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_UserRoles_UpdateUserRoles",
                    params: {
                        IN_userId: userId,
                        IN_roles: rolesTable,
                        IN_currentUserId: currentUserId,
                    },
                },
                {
                    name: "SP_SystemLog_CreateLog",
                    params: {
                        IN_userId: currentUserId,
                        IN_affectedEntity: "UserRoles",
                        IN_ipAddress: ipAddress,
                        IN_userAgent: userAgent,
                    },
                },
            ]);
            console.log(result);
            return result[0].length > 0;
        });
    }
    /**
     * Function to delete a user
     * @param userId
     * @param currentUserId
     * @returns Boolean
     */
    static deleteProfessor(professorId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_DeleteProfessor",
                    params: {
                        IN_professorId: professorId,
                        IN_currentUserId: currentUserId,
                    },
                },
            ]);
            return result[0].length > 0;
        });
    }
    /**
     * Function to get all the students
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getStudents(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetStudents", {
                IN_currentUserId: currentUserId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
    /**
     * Function to delete a user
     * @param userId
     * @param currentUserId
     * @returns Boolean
     */
    static deleteAccount(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runTransaction)([
                {
                    name: "SP_Users_DeleteUserAccount",
                    params: {
                        IN_currentUserId: currentUserId,
                    },
                },
            ]);
            return result[0].length > 0;
        });
    }
    /**
     * Function to get the professor details
     * @param currentUserId Current user ID
     * @param userId Professor id
     * @returns ProfessorInterface
     */
    static getProfessorDetails(userId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetProfessorDetails", {
                IN_currentUserId: currentUserId,
                IN_professorId: userId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            const parsedRaw = JSON.parse(jsonString)[0];
            const professorData = JSON.parse(parsedRaw.professorData || "[]");
            const courses = JSON.parse(parsedRaw.courses || "[]");
            const documents = JSON.parse(parsedRaw.documents || "[]");
            const students = JSON.parse(parsedRaw.students || "[]");
            const parsedResult = professorData[0] || {};
            parsedResult.courses = courses;
            parsedResult.documents = documents;
            parsedResult.students = students;
            return parsedResult;
        });
    }
    /**
     * Function to create a recommendation
     * @param documentId Course object with the new data
     * @param courseId Course object with the new data
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static createRecommendation(documentId, courseId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_CreateRecommendation", {
                IN_currentUserId: currentUserId,
                IN_courseId: courseId,
                IN_documentId: documentId,
            });
            return result[0][0].lastNotificationId;
        });
    }
    /**
     * Function to get the professor activities
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getProfesorsActivity(currentUserId, professorId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetProfesorsActivity", {
                IN_currentUserId: currentUserId,
                IN_professorId: professorId,
            });
            // Acceder al string dentro de la propiedad especial
            const rawJson = (_b = (_a = result === null || result === void 0 ? void 0 : result[0]) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"];
            if (!rawJson) {
                throw new Error("No se encontró JSON en el resultado del procedimiento");
            }
            const parsedRaw = JSON.parse(rawJson)[0];
            const studentsPerCourse = typeof parsedRaw["studentsPerCourse (JSON)"] === "string"
                ? JSON.parse(parsedRaw["studentsPerCourse (JSON)"])
                : parsedRaw["studentsPerCourse (JSON)"];
            const parsedResult = Object.assign(Object.assign({}, parsedRaw), { studentsPerCourse });
            return parsedResult;
        });
    }
    /**
     * Function to get the student metrics
     * @param currentUserId Current user ID
     * @returns Boolean
     */
    static getStudentsMetrics(currentUserId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetStudentsMetrics", {
                IN_currentUserId: currentUserId,
                IN_courseId: courseId,
            });
            const jsonString = (0, jsonParser_1.recordSetToJsonString)(result);
            const parsedResult = JSON.parse(jsonString);
            return parsedResult;
        });
    }
}
exports.default = UsersDao;
