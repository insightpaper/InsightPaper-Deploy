import { runStoredProcedure } from "../services/databaseService";
import { recordSetToJsonString } from "../utils/jsonParser";
import { NotificationInterface } from "../interfaces/Notifications/Notification";
export default class NotificationDao {
  /**
   * Function to get the notifications
   * @param currentUserId Current user ID
   * @returns The list of notifications
   */
  public static async getNotification(
    currentUserId: string,
    readStatus: boolean
  ): Promise<NotificationInterface[]> {
    const result = await runStoredProcedure("SP_Users_GetNotifications", {
      IN_currentUserId: currentUserId,
      IN_readStatus: readStatus,
    });

    const jsonString = recordSetToJsonString(result);

    if (!jsonString || jsonString.trim() === "") {
      return [];
    }

    const parsedResult = JSON.parse(jsonString) as NotificationInterface[];

    return parsedResult;
  }

  /**
   * Function to mark the notification as view
   * @param notificationId ID de la notifición
   * @param currentUserId ID del usuario activo
   * @returns notification id
   */
  public static async markAsView(
    notificationId: string | undefined,
    currentUserId: string | undefined
  ): Promise<boolean> {
    console.log("markAsView", notificationId, currentUserId);
    const result = await runStoredProcedure("SP_Users_MarkViewedNotification", {
      IN_notificationId: notificationId,
      IN_currentUserId: currentUserId,
    });
    console.log("result", result);
    return result[0][0].affectedEntityId;
  }

  /**
   *
   * @param currentUserId
   * @returns boolean
   */
  public static async markAllAsView(currentUserId: string): Promise<boolean> {
    const result = await runStoredProcedure(
      "SP_Users_MarkViewedAllNotification",
      {
        IN_currentUserId: currentUserId,
      }
    );
    return result[0][0].affectedEntityId;
  }

  /**
   * Function to delete a notification
   * @param notificationId ID de la notifición
   * @param currentUserId ID del usuario activo
   * @returns notification id
   */
  public static async deleteNotification(
    notificationId: string | undefined,
    currentUserId: string | undefined
  ): Promise<boolean> {
    const result = await runStoredProcedure("SP_Users_DeleteNotification", {
      IN_notificationId: notificationId,
      IN_currentUserId: currentUserId,
    });

    return result[0][0].affectedEntityId;
  }

  /**
   * Function to delete all notifications
   * @param currentUserId ID del usuario activo
   * @returns notification id
   */
  public static async deleteAllNotifications(
    currentUserId: string
  ): Promise<boolean> {
    const result = await runStoredProcedure(
      "SP_Users_DeleteAllNotification",
      {
        IN_currentUserId: currentUserId,
      }
    );

    return result[0][0].affectedEntityId;
  }
}
