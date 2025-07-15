"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_1 = __importDefault(require("../controllers/notification"));
const router = (0, express_1.Router)();
router.get("/", notification_1.default.getNotification);
router.put("/:notificationId", notification_1.default.markAsView);
router.put("/", notification_1.default.markAllAsView);
router.delete("/:notificationId", notification_1.default.deleteNotification);
router.delete("/", notification_1.default.deleteAllNotifications);
exports.default = router;
