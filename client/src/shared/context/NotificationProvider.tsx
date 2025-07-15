"use client";
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

import { apiRequest } from "../utils/request/apiRequest";

import { Notification } from "../interfaces/Notifications";
import { notifyError, notifySuccess } from "../utils/toastNotify";
interface NotificationContextType {
  openNotificationDrawer: boolean;
  setOpenNotificationDrawer: Dispatch<SetStateAction<boolean>>;
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
  isNotificationsLoading: boolean;
  setIsNotificationsLoading: Dispatch<SetStateAction<boolean>>;
  tabIndex: number;
  setTabIndex: Dispatch<SetStateAction<number>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  setTotalPages: Dispatch<SetStateAction<number>>;
  getNotifications: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotification: () => Promise<void>;
  markAsReadNotification: (id: string) => Promise<void>;
  markAllAsReadNotification: () => Promise<void>;
}

export const NotificationContext =
  createContext<NotificationContextType | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

function NotificationProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [openNotificationDrawer, setOpenNotificationDrawer] = useState(false);
  // 1 - Unread, 0 - Read
  const [tabIndex, setTabIndex] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const ROWS_PER_PAGE = 6;

  // SAMPLE DATA
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const getNotifications = async () => {
    try {
      setIsNotificationsLoading(true);
      const {result} = await apiRequest<{result: Notification[]}>({
        method: "get",
        url: "/api/notifications",
        params: {
          readStatus: Boolean(tabIndex),
          pageSize: ROWS_PER_PAGE,
          pageNumber: page,
        },
      });
      setNotifications(result);
      // setTotalPages(totalPages);
    } catch (error) {
      console.log(error)
      notifyError("Fallo al cargar las notificaciones");
    } finally {
      setIsNotificationsLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await apiRequest({
        method: "delete",
        url: `/api/notifications/${id}`,
      });
      notifySuccess("notificaciones eliminadas con éxito");
    } catch (error) {
      console.log(error)
      notifyError("Fallo al eliminar la notificación");
      throw error;
    }
  };

  const markAsReadNotification = async (id: string) => {
    try {
      await apiRequest({
        method: "put",
        url: `/api/notifications/${id}`,
      });
      notifySuccess("Notificación marcada como leída con éxito");
    } catch (error) {
      console.log(error)
      notifyError("Fallo al marcar la notificación como leída");
    }
  };

  const deleteAllNotification = async () => {
    try {
      await apiRequest({
        method: "delete",
        url: `/api/notifications/`,
      });
      notifySuccess("Todas las notificaciones eliminadas con éxito");
    } catch (error) {
      console.log(error)
      notifyError("Fallo al eliminar todas las notificaciones");
    }
  };

  const markAllAsReadNotification = async () => {
    try {
      await apiRequest({
        method: "put",
        url: `/api/notifications/`,
      });
      notifySuccess("Todas las notificaciones marcadas como leídas con éxito");
    } catch (error) {
      console.log(error)
      notifyError("Fallo al marcar todas las notificaciones como leídas");
    }
  };

  useEffect(() => {
    getNotifications();
  }, [tabIndex, page]);
  return (
    <NotificationContext.Provider
      value={{
        openNotificationDrawer,
        setOpenNotificationDrawer,
        notifications,
        setNotifications,
        isNotificationsLoading,
        setIsNotificationsLoading,
        tabIndex,
        setTabIndex,
        page,
        setPage,
        totalPages,
        setTotalPages,
        getNotifications,
        deleteNotification,
        deleteAllNotification,
        markAsReadNotification,
        markAllAsReadNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
