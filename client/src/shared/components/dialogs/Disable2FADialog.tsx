"use client";
import React, { useState } from "react";
import { Button, CircularProgress, DialogContentText } from "@mui/material";
import OtpInput from "../otp/OtpInput";
import Dialog from "./Dialog";
import ConfirmationDialog from "./ConfirmationDialog";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";

//CONTEXT
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";

//API
import { apiRequest } from "@/shared/utils/request/apiRequest";

//INTERFACE
import { UserData } from "@/shared/interfaces/UserData";

export default function Disable2FADialog(userData: Readonly<UserData>) {
  const { setCurrentUserData } = useSystemLayout();
  const [isDisabling, setIsDisabling] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [open, setOpen] = useState(false);
  const [typeSecret, setTypeSecret] = useState("");
  const toggleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const confirmCode = async () => {
    await apiRequest({
      method: "post",
      url: `/api/users/confirm-otp/${userData.userId}`,
      data: { otp: typeSecret },
    });
  };

  const disable2FA = async () => {
    setIsDisabling(true);
    try {
      await confirmCode();

      await apiRequest({
        method: "put",
        url: `/api/users/disable-otp/${userData.userId}`,
      });
      notifySuccess("2FA desactivado correctamente");
      //CLEAN UP

      setCurrentUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, doubleFactorEnabled: false };
      });
      setTypeSecret("");
      setOpen(false);
    } catch (error) {
      setOtpError(true);
      console.log(error);
      notifyError("Falló la desactivación de 2FA");
    } finally {
      setIsDisabling(false);
      setTimeout(() => {
        setOtpError(false);
      }, 500);
    }
  };

  return (
    <>
      <ConfirmationDialog
        title="Deshabilitar la autenticación de dos factores"
        content="¿Estás segura de que deseas desactivar la autenticación de dos factores?"
        confirmText="Si"
        cancelText="No"
        isPositiveAction={false}
        onCancel={() => toggleOpen(false)}
        onConfirm={() => toggleOpen(true)}
        className="w-full"
      >
        <Button color="error" variant="outlined" fullWidth size="small">
          Deshabilitar 2FA
        </Button>
      </ConfirmationDialog>
      <Dialog header="Disable 2FA" open={open} setOpen={toggleOpen}>
        <DialogContentText className="flex flex-col items-start !mb-4">
          Ingrese el código de autenticación de dos factores para deshabilitar
        </DialogContentText>
        <div className="flex flex-col gap-4 pt-3">
          <OtpInput
            otp={typeSecret}
            setOtp={(val) => setTypeSecret(val)}
            error={otpError}
            isLoading={isDisabling}
            disabled={isDisabling}
          />

          <div className="flex items-center justify-end">
            <Button
              variant="contained"
              onClick={disable2FA}
              disabled={isDisabling || typeSecret.length < 6}
            >
              {isDisabling ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Desactivar 2FA"
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
