import { useState, useEffect } from "react";
import { notifySuccess, notifyError } from "@/shared/utils/toastNotify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Dialog from "./Dialog";
import {
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import OtpFormDialog from "../otp/OtpFormDialog";
//CONSTANTS
import { passwordChecks } from "@/shared/constants/passwordChecks";

//ICONS
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

//INTERFACE
import { UserData } from "@/shared/interfaces/UserData";
import {
  defaultPasswordChangeSchema,
  FormData,
} from "@/modules/change-default-password/schemas/defaultPasswordChangeSchema";

//API
import { apiRequest } from "@/shared/utils/request/apiRequest";

interface UpdatePassDialogProps {
  userData: UserData;
}

export default function UpdatePassDialog({ userData }: UpdatePassDialogProps) {
  const [open, setOpen] = useState(false);
  const [openOtp, setOpenOtp] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(defaultPasswordChangeSchema) });
  const otpCode = watch("otp", "") as string;
  const password = watch("newPassword", "");
  const confirmPassword = watch("confirmPassword", "");
  const handleToggleOtp = () => {
    setOpenOtp(!openOtp);
  };
  const handleToggle = () => {
    setOpen(!open);
  };

  const sendOtpEmail = async () => {
    try {
      await apiRequest({
        method: "post",
        url: "/api/users/send-otp",
        data: { email: userData.email },
      });
    } catch (error) {
      console.log(error);
      notifyError("Failed to send OTP");
    }
  };

  const onSubmit = async () => {
    sendOtpEmail();
    handleToggle();
    handleToggleOtp();
  };

  const handleOtpSuccess = () => {
    notifySuccess("Password changed successfully");
    reset();
    handleToggleOtp();
  };

  const handleChangePassword = async () => {
    try {
      await apiRequest({
        method: "put",
        url: "/api/users/change-my-password",
        data: { password: password, otp: otpCode },
      });
    } catch (error) {
      console.log(error);
      notifyError("Failed to change password");
      throw error;
    }
  };

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open]);

  return (
    <>
      <Button size="small" variant="outlined" onClick={handleToggle} fullWidth>
        Cambiar contraseña
      </Button>
      <OtpFormDialog
        email={userData.email}
        isOpen={openOtp}
        onClose={handleToggleOtp}
        handleAction={handleChangePassword}
        otp={otpCode}
        setOtp={(val) => setValue("otp", val)}
        has2fa={userData.doubleFactorEnabled}
        onSuccess={handleOtpSuccess}
      />
      <Dialog header="Cambiar contraseña" open={open} setOpen={setOpen}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4 animate-fade-in mt-3  "
        >
          <Typography variant="subtitle1">Ingresa tu nueva contraseña:</Typography>
          <div className="flex flex-col gap-2">
            <Typography variant="caption">Nueva contraseña</Typography>
            <TextField
              {...register("newPassword")}
              id="newPassword"
              type="password"
              placeholder="Nueva contraseña"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Typography variant="caption">Confirmar contraseña</Typography>
            <TextField
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password"
              placeholder="Confirmar contraseña"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              className="p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <Typography variant="subtitle1">
              La contraseña debe cumplir con los siguientes requisitos:
            </Typography>
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
                  <ListItemText
                    primary={rule.text}
                    sx={{ fontSize: "0.9rem" }}
                  />
                </ListItem>
              ))}
            </List>
          </div>

          <Button
            type="submit"
            variant="outlined"
            disabled={isSubmitting}
            fullWidth
          >
            Cambiar contraseña
          </Button>
        </form>
      </Dialog>
    </>
  );
}
