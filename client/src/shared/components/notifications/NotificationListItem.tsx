"use client";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Badge,
} from "@mui/material";
import NotificationDrawer from "./NotificationDrawer";

//CONTEXT
import { useNotification } from "@/shared/context/NotificationProvider";

//ICONS
import { Notifications as BellIcon } from "@mui/icons-material";

export default function NotificationListItem() {
  const { notifications, openNotificationDrawer, setOpenNotificationDrawer } =
    useNotification();

  const handleToggleNotificationDrawer = () => {
    setOpenNotificationDrawer((prev) => !prev);
  };

  return (
    <>
      <ListItem
        className={`${openNotificationDrawer && " !bg-gradient-to-r from-accent-900  to-accent-800 !text-accent-300"} cursor-pointer group  !px-3  !p-1 relative text-white   hover:!text-accent-300 hover:opacity-80 transition-all duration-200 ease-in-out`}
        sx={{ borderRadius: 1 }}
        onClick={handleToggleNotificationDrawer}
      >
        <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
          <Badge
            variant="dot"
            badgeContent={notifications.filter((n) => !n.isRead).length}
            color="primary"
            max={99}
          >
            <BellIcon
              fontSize="small"
              className={`${notifications.filter((n) => !n.isRead).length && "animate-swing !text-base"}`}
            />
          </Badge>
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              variant="body2"
              className=" !text-xs group-hover:!text-accent-300 transition-all duration-200 ease-in-out"
            >
              Notificaciones
            </Typography>
          }
        />
      </ListItem>
      <NotificationDrawer
        open={openNotificationDrawer}
        toggleOpen={handleToggleNotificationDrawer}
      />
    </>
  );
}
