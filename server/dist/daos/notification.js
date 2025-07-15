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
class NotificationDao {
    /**
     * Function to get the notifications
     * @param currentUserId Current user ID
     * @returns The list of notifications
     */
    static getNotification(currentUserId, readStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_GetNotifications", {
                IN_currentUserId: currentUserId,
                IN_readStatus: readStatus,
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
     * Function to mark the notification as view
     * @param notificationId ID de la notifición
     * @param currentUserId ID del usuario activo
     * @returns notification id
     */
    static markAsView(notificationId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("markAsView", notificationId, currentUserId);
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_MarkViewedNotification", {
                IN_notificationId: notificationId,
                IN_currentUserId: currentUserId,
            });
            console.log("result", result);
            return result[0][0].affectedEntityId;
        });
    }
    /**
     *
     * @param currentUserId
     * @returns boolean
     */
    static markAllAsView(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_MarkViewedAllNotification", {
                IN_currentUserId: currentUserId,
            });
            return result[0][0].affectedEntityId;
        });
    }
    /**
     * Function to delete a notification
     * @param notificationId ID de la notifición
     * @param currentUserId ID del usuario activo
     * @returns notification id
     */
    static deleteNotification(notificationId, currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_DeleteNotification", {
                IN_notificationId: notificationId,
                IN_currentUserId: currentUserId,
            });
            return result[0][0].affectedEntityId;
        });
    }
    /**
     * Function to delete all notifications
     * @param currentUserId ID del usuario activo
     * @returns notification id
     */
    static deleteAllNotifications(currentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, databaseService_1.runStoredProcedure)("SP_Users_DeleteAllNotification", {
                IN_currentUserId: currentUserId,
            });
            return result[0][0].affectedEntityId;
        });
    }
}
exports.default = NotificationDao;
