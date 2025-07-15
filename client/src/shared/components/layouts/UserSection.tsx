"use client";
import React from "react";
import { Avatar, Typography, Tooltip, Skeleton } from "@mui/material";
import UserDrawer from "./UserDrawer";

// CONTEXT
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";

export default function UserSection() {
  const { currentUserData, isUserDataLoading } = useSystemLayout();

  if (isUserDataLoading || currentUserData === null) {
    return (
      <div className="flex items-center justify-between p-1 w-full">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="w-1/2 flex flex-col">
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="text" width={80} height={16} />
        </div>
        <Skeleton variant="circular" width={20} height={20} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-1 w-full">
      <Avatar className=" !bg-accent-400">
        {currentUserData?.name?.[0] || ""}
      </Avatar>
      <div className="w-1/2 flex flex-col">
        <Tooltip title={currentUserData?.name || ""} arrow>
          <Typography
            variant="body2"
            className=" !text-nowrap overflow-hidden text-ellipsis"
          >
            {currentUserData?.name || ""}
          </Typography>
        </Tooltip>
        {/* ROLES */}
        <Typography
          variant="caption"
          className=" !text-primary-300 !text-xs !text-nowrap overflow-hidden text-ellipsis"
        >
          {currentUserData?.roles
          ? currentUserData?.roles
              .map((role) => {
                switch (role.name) {
                  case "Admin":
                    return "Administrador";
                  case "Professor":
                    return "Profesor";
                  case "Student":
                    return "Estudiante";
                  default:
                    return role.name;
                }
              })
              .join(", ")
          : ""}
        </Typography>
      </div>
      <UserDrawer />
    </div>
  );
}
