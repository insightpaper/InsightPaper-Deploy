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
const notification_1 = __importDefault(require("../daos/notification"));
class NotificationController {
    /**
     * Function to get the notifications
     * @param req
     * @param res
     */
    static getNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const readStatus = req.query.readStatus === "true";
                const result = yield notification_1.default.getNotification(requesterUserId, readStatus);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error getting the notifications", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to mark a notification as view
     * @param req
     * @param res
     */
    static markAsView(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationId = req.params.notificationId;
                const requesterUserId = req.user.userId;
                const result = yield notification_1.default.markAsView(notificationId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error marking the notification as view", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Mark all notifications as view
     * @param req
     * @param res
     */
    static markAllAsView(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield notification_1.default.markAllAsView(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error marking all notifications as view", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to delete a notification
     * @param req
     * @param res
     */
    static deleteNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notificationId = req.params.notificationId;
                const requesterUserId = req.user.userId;
                const result = yield notification_1.default.deleteNotification(notificationId, requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error deleting the notification", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
    /**
     * Function to delete all notifications
     * @param req
     * @param res
     */
    static deleteAllNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requesterUserId = req.user.userId;
                const result = yield notification_1.default.deleteAllNotifications(requesterUserId);
                res.status(200).json({ result });
            }
            catch (error) {
                if (error instanceof ValidationError_1.ValidationError) {
                    res.status(400).json({ error: error.cause });
                }
                else {
                    console.error("Error deleting all notifications", error);
                    res.status(500).json({ error: "unexpected_error" });
                }
            }
        });
    }
}
exports.default = NotificationController;
