import React from "react";
import { Card, CardContent, Skeleton } from "@mui/material";

export default function NotificationCardSkeleton() {
  return (
    <Card
      variant="outlined"
      className={`relative mb-2 h-fit min-h-20 !p-0 rounded-lg  shadow-md !bg-primary-900 text-white   transition-all `}
    >
      <CardContent className="flex flex-col min-h-8 gap-3 !px-3">
        <div className="flex items-center gap-2 flex-1">
          {/* Skeleton for Notification Icon */}
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            className="mr-1 !max-h-8 !max-w-8"
          />

          {/* Skeleton for Notification Content */}
          <div className="flex flex-col items-start w-full">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="80%" height={16} />

            <div className="flex items-center justify-between w-full gap-2 mt-2">
              <Skeleton variant="text" width={100} height={14} />
              <Skeleton variant="rectangular" width={50} height={20} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
