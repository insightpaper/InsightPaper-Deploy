"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Typography,
  IconButton,
  Tabs,
  Tab,
  List,
  Pagination,
  CircularProgress,
  Button,
} from "@mui/material";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import { mainDrawerWidth } from "../layouts/Sidebar";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import NotificationCard from "./NotificationCard";
import NotificationCardSkeleton from "./NotificationCardSkeleton";

//CONTEXT
import { useNotification } from "@/shared/context/NotificationProvider";

//ICONS
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

interface NotificationDrawerProps {
  open: boolean;
  toggleOpen: () => void;
}

export default function NotificationDrawer({
  open,
  toggleOpen,
}: Readonly<NotificationDrawerProps>) {
  const pathname = usePathname();
  const {
    notifications,
    setNotifications,
    isNotificationsLoading,
    setOpenNotificationDrawer,
    tabIndex,
    setTabIndex,
    page,
    setPage,
    totalPages,
    deleteAllNotification,
    markAllAsReadNotification,
  } = useNotification();
  const [isAllMarking, setIsAllMarking] = useState(false);
  const [isAllDeleting, setIsAllDeleting] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const tadLabels = ["Sin leer", "Leído"];

  const handleChangeTab = (
    event: React.SyntheticEvent,
    newTadIndex: number
  ): void => {
    setPage(1);
    setTabIndex(newTadIndex);
  };

  const handleDeleteAll = async () => {
    try {
      setIsAllDeleting(true);
      await deleteAllNotification();
      setNotifications([]);
    } catch {
    } finally {
      setIsAllDeleting(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsAllMarking(true);
      await markAllAsReadNotification();
      setNotifications([]);
    } catch {
    } finally {
      setIsAllMarking(false);
    }
  };

  useEffect(() => {
    setOpenNotificationDrawer(false);
  }, [pathname]);

  return (
    <Drawer
      variant="temporary"
      anchor={"left"}
      open={open}
      onClose={toggleOpen}
      keepMounted={false}
      elevation={0}
      PaperProps={{
        className: "!bg-primary-800",
      }}
      sx={{
        position: "absolute",
        [`& .${drawerClasses.paper}`]: {
          width: isTablet ? (isMobile ? "100%" : "75%") : "300px",
          height: "100%",
          left: isTablet ? 0 : mainDrawerWidth, // Anchored to the main drawer's width
          borderRight: "1px solid #404040",
          borderTopRightRadius: "8px",
          borderBottomRightRadius: "8px",
          boxShadow: "16px 10px 12px rgba(0, 0, 0, 0.1)", // Added shadow
        },
      }}
    >
      {/* Header Section with Close Button */}
      <div className="flex flex-col gap-2 border-b border-primary-700 !bg-primary-950 ">
        <div className="flex  relative items-center justify-center px-1 py-3">
          <IconButton className="!absolute left-1 " onClick={toggleOpen}>
            <KeyboardDoubleArrowLeftIcon />
          </IconButton>

          <Typography
            variant="h6"
            className="text-white !text-lg  text-center "
          >
            Notificaciones
          </Typography>
        </div>
        <div className="px-2 ">
          <ConfirmationDialog
            className="!p-0 "
            title={"¿Estás seguro de que deseas eliminar todas las notificaciones?"}
            content={
              "Esta acción no se puede deshacer. Se eliminarán todas las notificaciones, tanto leídas como no leídas."
            }
            cancelText={"Cancelar"}
            confirmText={"Eliminar todo"}
            onConfirm={handleDeleteAll}
            onCancel={() => {}}
            isPositiveAction={false}
          >
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={isAllDeleting}
              className="!text-xs "
            >
              {isAllDeleting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Eliminar todo"
              )}
            </Button>
          </ConfirmationDialog>
        </div>
        <div>
          <Tabs
            value={tabIndex}
            onChange={handleChangeTab}
            variant="fullWidth"
            className="border-t border-primary-700 "
            sx={{
              minHeight: "auto",
            }}
          >
            {tadLabels.map((label, index) => (
              <Tab
                key={index}
                label={<Typography variant="caption">{label}</Typography>}
                sx={{
                  "&.MuiButtonBase-root": {
                    padding: 1,
                    minHeight: "auto",
                  },
                }}
              />
            ))}
          </Tabs>
        </div>
      </div>
      {/* DRAWER CONTENT */}
      <List
        sx={{ px: 1, flexGrow: 1, overflowY: "auto", pb: 3 }}
        className="relative !bg-primary-800 "
      >
        {/* BLUR */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2  w-[150px]  h-[200px]  rounded-full bg-primary-700   blur-3xl" />
        {/* FUTURE FEATURES */}
        {/* <div className="flex items-center gap-1 !bg-primary-800 mb-3">
          <NotificationFilter /> <NotificationOrder />
        </div> */}
        <div className="w-full flex items-center gap-2 mb-4">
          {tabIndex === 0 &&
            notifications.length > 0 &&
            !isNotificationsLoading && (
              <ConfirmationDialog
                className="!w-full !p-0"
                title={"Marcar todo como leído"}	
                content={
                  "¿Estás seguro de que deseas marcar todas las notificaciones como leídas?"
                }
                cancelText={"Cancelar"}
                confirmText={"Marcar todo"}
                onConfirm={handleMarkAllAsRead}
                onCancel={() => {}}
              >
                <Button
                  size="small"
                  fullWidth
                  variant="outlined"
                  disabled={isAllMarking}
                  className="!text-xs !p-1 !m-0 text-primary-400! border-primary-400! hover:!bg-primary-400!"
                >
                  {isAllMarking ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Marcar todo como leído"
                  )}
                </Button>
              </ConfirmationDialog>
            )}
        </div>

        {isNotificationsLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <NotificationCardSkeleton key={index} />
            ))
          : notifications.map((notification, index) => (
              <div key={index} className="mb-2">
                <NotificationCard index={index} {...notification} />
              </div>
            ))}
        {notifications.length === 0 && !isNotificationsLoading && (
          <Typography
            variant="body2"
            className="!text-primary-400 italic !text-center p-3 !z-20"
          >
            Sin notificaciones
          </Typography>
        )}
        <div className="flex justify-center items-end  w-full mt-auto ">
          {totalPages > 1 && notifications.length > 0 && (
            <Pagination
              page={page}
              onChange={(e, val) => {
                setPage(val);
              }}
              size="small"
              count={totalPages}
              variant="outlined"
              color="primary"
            />
          )}
        </div>
      </List>
    </Drawer>
  );
}
