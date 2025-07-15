"use client";
import Image from "next/image";
import { styled, useTheme } from "@mui/material/styles";
import { List, Box, Divider } from "@mui/material";
import UserSection from "./UserSection";
import ListItemSidebar, { Route } from "./ListItemSidebar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import NotificationListItem from "../notifications/NotificationListItem";
import Link from "next/link";
import Logo from "../../../../public/Logo.png";

import {
  Dashboard as DashboardIcon,
  Archive as ArchiveIcon,
  People as UsersIcon,
  Work as WorkIcon,
} from "@mui/icons-material";

export const mainDrawerWidth = 200;

export default function Sidebar({
  open,
  handleOpen,
}: {
  open: boolean;
  handleOpen: () => void;
}) {

  const primaryRoutes: Route[] = [
    // TODO: Add Dashboard route
    {
      label: "Dashboard",
      href: "/",
      isDropdown: false,
      icon: DashboardIcon,
    },
    {
      label: "Cursos",
      icon: WorkIcon,
      isDropdown: false,
      href: "/courses",
    },
    {
      label: "Documentos",
      icon: ArchiveIcon,
      isDropdown: false,
      href: "/documents/student",
    },
  ];

  const secondaryRoutes: Route[] = [
    {
      label: "Usuarios",
      icon: UsersIcon,
      href: "/users",
    },
  ];

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const variant = isMobile ? "temporary" : "permanent";

  const MainDrawer = styled(MuiDrawer)({
    width: mainDrawerWidth,
    flexShrink: 0,
    boxSizing: "border-box",
    mt: 10,
    [`& .${drawerClasses.paper}`]: {
      width: mainDrawerWidth,
      boxSizing: "border-box",
      borderRight: "1px solid #404040",
    },
  });

  return (
    <MainDrawer
      open={isMobile ? open : true} // control open state only for mobile
      variant={variant}
      anchor={isMobile ? "right" : "left"}
      elevation={0}
      onClose={handleOpen}
      PaperProps={{
        className: "!bg-black ",
      }}
      sx={{
        zIndex: 1200 + (isMobile ? 0 : 1),
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: "column",
          height: "100%", // Ensure the drawer takes full height
        },
      }}
    >
      <Box className="flex justify-center py-3 relative">
        <div className="absolute -top-12 w-[100px] h-[100px] rounded-full bg-accent-500  blur-3xl" />
        <Link href="/" className="z-10">
          <Image alt="" src={Logo} width={130} height={70} />
        </Link>
      </Box>

      <List sx={{ px: 1, flexGrow: 1, overflowY: "auto" }}>
        {primaryRoutes.map((route) => (
          <ListItemSidebar {...route} key={route.label}>
            {route.children}
          </ListItemSidebar>
        ))}
      </List>
      <Divider className=" bg-primary-800" />
      <List sx={{ px: 1 }}>
        <NotificationListItem />

        {secondaryRoutes.map((route) => (
          <ListItemSidebar {...route} key={route.label} />
        ))}
      </List>

      <Divider className=" bg-primary-800" />

      <div className="flex items-center justify-between p-1 w-full">
        <UserSection />
      </div>
    </MainDrawer>
  );
}
