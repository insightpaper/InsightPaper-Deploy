import { ValidationError } from "../errors/ValidationError";
import { Request, Response } from "express";
import NotificationDao from "../daos/notification";

export default class NotificationController {
  /**
   * Function to get the notifications
   * @param req
   * @param res
   */

  public static async getNotification(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;
      const readStatus = req.query.readStatus === "true";
      const result = await NotificationDao.getNotification(
        requesterUserId,
        readStatus
      );
      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error getting the notifications", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to mark a notification as view
   * @param req
   * @param res
   */
  public static async markAsView(req: Request, res: Response): Promise<void> {
    try {
      const notificationId = req.params.notificationId;
      const requesterUserId = req.user.userId;

      const result = await NotificationDao.markAsView(
        notificationId,
        requesterUserId
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error marking the notification as view", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Mark all notifications as view
   * @param req
   * @param res
   */
  public static async markAllAsView(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await NotificationDao.markAllAsView(requesterUserId);

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error marking all notifications as view", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to delete a notification
   * @param req
   * @param res
   */
  public static async deleteNotification(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const notificationId = req.params.notificationId;
      const requesterUserId = req.user.userId;

      const result = await NotificationDao.deleteNotification(
        notificationId,
        requesterUserId
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error deleting the notification", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }

  /**
   * Function to delete all notifications
   * @param req
   * @param res
   */
  public static async deleteAllNotifications(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const requesterUserId = req.user.userId;

      const result = await NotificationDao.deleteAllNotifications(
        requesterUserId
      );

      res.status(200).json({ result });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.cause });
      } else {
        console.error("Error deleting all notifications", error);
        res.status(500).json({ error: "unexpected_error" });
      }
    }
  }
}
