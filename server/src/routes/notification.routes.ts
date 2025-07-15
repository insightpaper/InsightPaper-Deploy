import { Router } from "express";
import NotificationsController from "../controllers/notification";

const router = Router();

router.get("/", NotificationsController.getNotification);
router.put("/:notificationId", NotificationsController.markAsView);
router.put("/", NotificationsController.markAllAsView);
router.delete("/:notificationId", NotificationsController.deleteNotification);
router.delete("/", NotificationsController.deleteAllNotifications);


export default router;