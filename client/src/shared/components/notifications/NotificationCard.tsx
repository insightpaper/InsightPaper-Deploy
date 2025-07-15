import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Tooltip,
  CircularProgress,
} from "@mui/material";

import {
  AccountCircle,
  WorkOutline,
  Close,
  DoneAll,
  Done,
} from "@mui/icons-material";

import { useNotification } from "@/shared/context/NotificationProvider";

//UTILS
import { timeAgo, formatDate } from "@/shared/utils/date/dateFormatter";

import { Notification } from "@/shared/interfaces/Notifications";

interface NotificationCardProps extends Notification {
  index: number;
}

export default function NotificationCard(
  props: Readonly<NotificationCardProps>
) {
  const { deleteNotification, markAsReadNotification, setNotifications } =
    useNotification();
  const {
    index,
    title,
    message,
    objectType,
    createdDate,
    // notificationId,
    isRead,
    objectId,
  } = props;
  const [isDeleting, setIsDeleting] = useState(false);
  const [seeMore, setSeeMore] = useState(false);
  const [isOverflowed, setIsOverflowed] = useState(false);
  const typographyRef = useRef<HTMLParagraphElement | null>(null);
  const typeIcons: Record<Notification["objectType"], React.JSX.Element> = {
    ProjectCreators: <AccountCircle />,
    Projects: <WorkOutline />,
  };

  const typeByUrl = {
    Projects: "/projects/",
    Project: "/projects/",
    ProjectCreators: "/projects/",
  };
  const baseUrl = typeByUrl?.[objectType];
  const urlAction = baseUrl + objectId;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteNotification(objectId as string);
      setNotifications((prev) => {
        prev.splice(index, 1);
        return [...prev];
      });
    } catch {
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkRead = async () => {
    try {
      setIsDeleting(true);
      if (!isRead) {
        await markAsReadNotification(objectId as string);
        setNotifications((prev) => {
          prev.splice(index, 1);
          return [...prev];
        });
      }
    } catch {
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const element = typographyRef.current;
    if (element) {
      // Check if the content overflows
      const isOverflowing = element.scrollHeight > element.offsetHeight;
      setIsOverflowed(isOverflowing);
    }
  }, [typographyRef.current, message]);

  return (
    <Card
      variant="outlined"
      className={`${isDeleting && "animate-pulse-fast"}  relative h-fit min-h-20 !p-0 rounded-lg  shadow-md !bg-primary-900 text-white   transition-all `}
    >
      <CardContent className="flex  flex-col  min-h-16 gap-3 !px-3 ">
        <div className="flex items-center gap-2 flex-1">
          {/* Notification Icon */}
          <div className="mr-1">{typeIcons[objectType]}</div>
          {/* Notification Content */}
          <div className="flex flex-col  items-start w-full ">
            <div className="flex gap-1 w-full ">
              <div className="flex flex-col  gap-1 w-full">
                <div className="flex items-center gap-1">
                  <Typography
                    variant="subtitle2"
                    className={`font-semibold text-white z-10 ${baseUrl && "hover:underline"}`}
                    component={baseUrl ? Link : "span"}
                    href={baseUrl ? urlAction : undefined}
                  >
                    {title}{" "}
                  </Typography>
                </div>

                <Typography
                  ref={typographyRef}
                  variant="caption"
                  component="p"
                  className={`break-words !text-primary-400 transition-all ${
                    seeMore ? "overflow-visible" : "line-clamp-1 max-h-10"
                  }`}
                >
                  {message}
                </Typography>
                {isOverflowed && (
                  <Typography
                    component={"button"}
                    onClick={() => setSeeMore(!seeMore)}
                    className="my-4 !text-accent-500"
                    variant="caption"
                  >
                    {seeMore ? "Ver menos" : "Ver más"}
                  </Typography>
                )}
              </div>
              <div className="flex items-center justify-center h-full">
                <Tooltip title="Delete">
                  <IconButton size="small" onClick={handleDelete}>
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center justify-between w-full gap-2">
              <Tooltip title={formatDate(createdDate)}>
                <Typography
                  variant="caption"
                  component={"span"}
                  className="!text-primary-600 !text-xs !m-0"
                >
                  {timeAgo(createdDate)}
                </Typography>
              </Tooltip>

              {(() => {
                if (!isRead) {
                  if (isDeleting) {
                    return <CircularProgress size={20} color="inherit" />;
                  } else {
                    return (
                      <Tooltip title="Mark as read">
                        <IconButton
                          onClick={handleMarkRead}
                          className="!text-accent-500 !m-0 !text-xs !p-0"
                        >
                          <Done fontSize="small" className="!text-accent-500" />
                        </IconButton>
                      </Tooltip>
                    );
                  }
                } else {
                  return (
                    <Tooltip title="Read">
                      <DoneAll fontSize="small" className="!text-accent-500" />
                    </Tooltip>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
