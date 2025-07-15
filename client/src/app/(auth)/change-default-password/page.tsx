"use client";
import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import OtpFormDialog from "@/shared/components/otp/OtpFormDialog";
import {
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
//ICONS
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

//UTILS
import { jwtDecode } from "jwt-decode";
import { passwordChecks } from "@/shared/constants/passwordChecks";

//AXIOS
import { apiRequest } from "@/shared/utils/request/apiRequest";
import axios from "axios";

//INTERFACES
import { UserData } from "@/shared/interfaces/UserData";

//SCHEMAS
import {
  defaultPasswordChangeSchema,
  FormData,
} from "@/modules/change-default-password/schemas/defaultPasswordChangeSchema";

export default function ChangeDefaultPasswordPage() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(defaultPasswordChangeSchema) });
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [openOtp, setOpenOtp] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    if (isSubmitting || !userData) return;
    try {
      await apiRequest({
        method: "put",
        url: "/api/users/change-my-password",
        data: { password: data.newPassword, otp: data.otp },
      });
      notifySuccess("Contraseña cambiada con éxito");
      await axios.delete("/api/cookieAuth");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.log(error)
      notifyError("Ha ocurrido un error");
    }
  };

  const getUserData = async () => {
    try {
      const jwtResponse = await axios.get("/api/cookieAuth");
      const jwt = jwtResponse.data.jwt;
      const decodedJwt = jwt ? (jwtDecode(jwt) as UserData) : null;
      setUserData(decodedJwt);
    } catch {}
  };

  const sentOtp = async () => {
    try {
      if (!userData) return;
      await apiRequest({
        method: "post",
        url: "/api/users/send-otp",
        data: { email: userData?.email },
      });
    } catch (error) {
      console.log(error)
      notifyError("Ha ocurrido un error");
    }
  };

  const handleChangePassword = async () => {
    trigger();
    const result = defaultPasswordChangeSchema.safeParse({
      newPassword: watch("newPassword"),
      confirmPassword: watch("confirmPassword"),
    });
    if (!result.success) {
      return;
    }

    setOpenOtp(true);
    setIsLoading(true);
    sentOtp();
  };

  const password = watch("newPassword", "");
  const confirmPassword = watch("confirmPassword", "");

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Card
      variant="outlined"
      className="!relative flex h-screen w-full !rounded-none   !bg-primary-950"
    >
      <OtpFormDialog
        email={userData?.email || ""}
        otp={watch("otp", "") || ""}
        setOtp={(otp) => {
          setValue("otp", otp);
        }}
        isOpen={openOtp}
        onClose={() => {
          setOpenOtp(false);
          setIsLoading(false);
        }}
        onSuccess={() => setOpenOtp(false)}
        handleAction={handleSubmit(onSubmit)}
      />
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2   w-[400px] h-[150px] sm:h-[200px] rounded-full bg-accent-950 blur-[80px] animate-pulse" />
      <CardContent className="flex flex-col !py-3  justify-center items-center  h-full w-full  ">
        <div className="flex flex-col items-center gap-1 mb-6  z-10 w-fit-content ">
          <Typography
            variant="h4"
            className="text-center md:text-nowrap"
          >
            Bienvenido a Insight Paper
          </Typography>
          <Typography variant="body2" className="!text-primary-400 text-center">
            Necesitas cambiar tu{" "}
            <span className="font-bold">contraseña por defecto</span> para continuar
          </Typography>
        </div>
        <form className="flex flex-col gap-4 mt-2 sm:mt-4 w-fit animate-fade-in ">
          <div className="flex flex-col gap-2">
            <Typography variant="caption">Nueva contraseña</Typography>
            <TextField
              {...register("newPassword", {
                required: "Password is required",
              })}
              id="newPassword"
              type="password"
              placeholder="Digite su nueva contraseña"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Typography variant="caption">Confirmar contraseña</Typography>
            <TextField
              {...register("confirmPassword", {
                required: "Confirm your password",
              })}
              id="confirmPassword"
              type="password"
              placeholder="Digite nuevamente la contraseña"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              className="p-2 border border-gray-300 rounded"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isSubmitting || isLoading}
            variant="contained"
            fullWidth
          >
            {isLoading || isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Cambiar contraseña"
            )}
          </Button>

          <List dense sx={{ color: "gray" }}>
            {passwordChecks(password, confirmPassword).map((rule, index) => (
              <ListItem key={index} sx={{ gap: 1 }}>
                <ListItemIcon>
                  {rule.valid ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CancelIcon color="disabled" />
                  )}
                </ListItemIcon>
                <ListItemText primary={rule.text} sx={{ fontSize: "0.9rem" }} />
              </ListItem>
            ))}
          </List>
        </form>
      </CardContent>
    </Card>
  );
}
