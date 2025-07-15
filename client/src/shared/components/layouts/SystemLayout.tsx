"use client";
import { useState } from "react";

//COMPONENTS
import Header from "./Header";
import Sidebar from "./Sidebar";

//PROVIDER
import SystemLayoutProvider from "@/shared/context/SystemLayoutProvider";
import NotificationProvider from "@/shared/context/NotificationProvider";
import PermissionsProvider from "@/shared/context/PermissionProvider";

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openSideBar, setOpenSideBar] = useState(false);
  const handleOpenSideBar = () => {
    setOpenSideBar((prev) => !prev);
  };

  return (
    <div className="flex h-screen">
      <SystemLayoutProvider>
        <PermissionsProvider>
          <NotificationProvider>
            <div className="flex w-full h-full">
              <Sidebar open={openSideBar} handleOpen={handleOpenSideBar} />
              <main className="flex flex-col w-full h-full">
                <Header handleOpenSideBar={handleOpenSideBar} />
                <div className="relative overflow-x-auto overflow-y-auto w-full flex-1">
                  {children}
                </div>
              </main>
            </div>
          </NotificationProvider>
        </PermissionsProvider>
      </SystemLayoutProvider>
    </div>
  );
}
