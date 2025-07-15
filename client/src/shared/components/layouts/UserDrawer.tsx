"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { Typography, IconButton, Button, Avatar, Divider } from "@mui/material";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import { mainDrawerWidth } from "../layouts/Sidebar";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Enable2FADialog from "../dialogs/Enable2FADialog";
import Disable2FADialog from "../dialogs/Disable2FADialog";
import UpdatePassDialog from "../dialogs/UpdatePassDialog";

//CONTEXT
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";

// AXIOS
import axios from "axios";

//ICONS
import { Logout as LogOutIcon } from "@mui/icons-material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LockIcon from "@mui/icons-material/Lock";
import SettingsIcon from "@mui/icons-material/Settings";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import EditUserDialog from "./EditUserDialog";

export default function UserDrawer() {
  const { currentUserData, deleteUser } = useSystemLayout();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    await axios.delete("/api/cookieAuth");
    router.push("/login");
  };

  const handleDeleteUser = async () => {
    await deleteUser();
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <IconButton size="small" onClick={toggleOpen}>
        <MoreVertIcon />
      </IconButton>
      <Drawer
        variant="temporary"
        anchor={"left"}
        open={open}
        onClose={toggleOpen}
        keepMounted={false}
        elevation={0}
        PaperProps={{
          className: "!bg-primary-950",
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
        <div className="flex flex-col gap-2 border-b border-primary-700 bg-primary-900 z-20  relative items-center justify-center px-1 py-3">
          <IconButton className="!absolute left-1 z-10" onClick={toggleOpen}>
            <KeyboardDoubleArrowLeftIcon />
          </IconButton>

          <Typography
            variant="h6"
            className="text-white !text-lg  text-center z-10 "
          >
            Perfil de Usuario
          </Typography>
        </div>

        {/* // Body Section */}
        <div className="relative flex flex-col flex-1 bg-primary-900 p-6">
          {/* Background Blur */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[200px] h-[100px] rounded-full bg-accent-800 animate-fade-in blur-[80px]" />
          <EditUserDialog className="!absolute top-1 right-1" />
          {/* User Avatar */}
          <div className="relative flex flex-col items-center justify-center my-8 animate-fade-in">
            <Avatar className=" !bg-accent-400">
              {currentUserData?.name?.[0] ?? ""}
            </Avatar>

            {/* User Name */}
            <Typography variant="h5" className="font-bold text-white mb-1">
              {currentUserData?.name ?? "UserName"}{" "}
            </Typography>

            {/* User Email */}
            <Typography variant="body2" className="!text-primary-400 mb-6">
              {currentUserData?.email ?? "user@example.com"}
            </Typography>
          </div>

          {currentUserData?.doubleFactorEnabled && (
            <div className="flex items-center justify-center mb-2 gap-2 text-accent-400">
              <LockIcon className=" !text-base" />
              <Typography variant="caption">2FA activado</Typography>
            </div>
          )}

          <div className="flex flex-wrap lg:flex-col gap-2">
            {/* User Details */}
            <div className="w-full flex flex-col gap-4">
              <div className="bg-primary-800 rounded-lg p-4 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Typography
                    variant="subtitle2"
                    className="!text-primary-400 mb-2"
                  >
                    Role{(currentUserData?.roles?.length ?? 0) > 1 && "s"}:
                  </Typography>
                  <Typography variant="body2">
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
                      : "Sin Role"}
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          <Divider textAlign="left" className="!text-primary-400 !my-4">
            <SettingsIcon fontSize="small" className="!mr-2 " />
            <Typography variant="caption" className="!text-primary-400  ">
              Seguridad
            </Typography>
          </Divider>

          <div className="w-full flex flex-row lg:flex-col items-center justify-center gap-3 ">
            {currentUserData && <UpdatePassDialog userData={currentUserData} />}

            {/* 2FA Button */}
            {currentUserData &&
              (currentUserData?.doubleFactorEnabled ? (
                <Disable2FADialog {...currentUserData} />
              ) : (
                <Enable2FADialog {...currentUserData} />
              ))}
          </div>

          {/* Logout Button */}
          <div className=" mt-auto w-full flex justify-end lg:items-center lg:flex-col gap-5">
            <ConfirmationDialog
              title="Cerrar Sesión"
              content="¿Estás seguro que deseas cerrar la sesión?"
              confirmText="Cerrar Sesión"
              cancelText="Cancelar"
              isPositiveAction={false}
              onCancel={() => { }}
              onConfirm={handleLogout}
            >
              <Button
                size="small"
                endIcon={
                  <LogOutIcon className="group-hover:scale-125 !transition-all duration-200 ease-in-out" />
                }
                color="error"
                className="group w-fit lg:max-w-[280px] py-2 mt-8"
              >
                Cerrar sesión
              </Button>
            </ConfirmationDialog>
            <ConfirmationDialog
              title="Eliminar Cuenta"
              content="¿Estás seguro que deseas eliminar tu cuenta?"
              confirmText="Eliminar Cuenta"
              cancelText="Cancelar"
              isPositiveAction={false}
              onCancel={() => { }}
              onConfirm={handleDeleteUser}
            >
              <Button
                size="small"
                color="error"
                variant="contained"
                className="group w-fit lg:max-w-[280px] py-2 mt-8"
              >
                Eliminar cuenta
              </Button>
            </ConfirmationDialog>
          </div>
        </div>
      </Drawer>
    </>
  );
}
