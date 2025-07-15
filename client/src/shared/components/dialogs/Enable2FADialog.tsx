import React, { useState } from "react";
import Image from "next/image";
import { Button, Typography, Skeleton, CircularProgress } from "@mui/material";
import OtpInput from "../otp/OtpInput";
import Dialog from "./Dialog";
import CopyText from "../CopyText";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";

import ImageNotSupportedIcon from "@mui/icons-material/ImageNotSupported";

//CONTEXT
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";

//API
import { apiRequest } from "@/shared/utils/request/apiRequest";

//INTERFACE
import { UserData } from "@/shared/interfaces/UserData";

export default function Enable2FADialog(userData: Readonly<UserData>) {
  const { setCurrentUserData } = useSystemLayout();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isCofirming, setIsCofirming] = useState(false);
  const [open, setOpen] = useState(false);
  const [typeSecret, setTypeSecret] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [otpError, setOtpError] = useState(false);
  const toggleOpen = (isOpen: boolean) => {
    if (isOpen) enable2FA();
    setOpen(isOpen);
  };

  const enable2FA = async () => {
    try {
      setIsDataLoading(true);
      const { qrCode, secret } = await apiRequest<{
        qrCode: string;
        secret: string;
      }>({
        method: "put",
        url: `/api/users/enable-otp/${userData.userId}`,
      });

      setQrCode(qrCode);
      setSecretCode(secret);
    } catch (error) {
      console.log(error);
      notifyError("Failed to enable 2FA");
    } finally {
      setIsDataLoading(false);
    }
  };

  const confirmCode = async () => {
    try {
      setIsCofirming(true);
      await apiRequest({
        method: "post",
        url: `/api/users/confirm-otp/${userData.userId}`,
        data: { otp: typeSecret },
      });
      notifySuccess("2FA enabled successfully");
      setCurrentUserData((prev) => {
        if (!prev) return prev;
        return { ...prev, doubleFactorEnabled: true };
      });
      //CLEAN UP
      setTypeSecret("");
      setQrCode("");
      setSecretCode("");
      setOtpError(false);
      toggleOpen(false);
    } catch (error) {
      setOtpError(true);
      console.log(error);
      notifyError("Failed to enable 2FA");
    } finally {
      setIsCofirming(false);
      setTimeout(() => {
        setOtpError(false);
      }, 500);
    }
  };

  return (
    <>
      <Button
        size="small"
        fullWidth
        variant="contained"
        color="primary"
        onClick={() => toggleOpen(true)}
      >
        Activar 2FA
      </Button>
      <Dialog
        maxWidth="sm"
        header="Habilitar la autenticación de dos factores (2FA) "
        open={open}
        setOpen={toggleOpen}
      >
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          {/* QR Code */}

          <div className="flex flex-col items-center gap-4">
            <Typography variant="h6" className="text-center font-semibold">
            Escanea el código QR
            </Typography>
            {(() => {
              if (isDataLoading) {
                return <Skeleton variant="rounded" width={200} height={200} />;
              } else if (qrCode) {
                return (
                  <Image
                    src={qrCode}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="border rounded-lg animate-fade-in  bg-white"
                  />
                );
              } else {
                return (
                  <div className="border flex justify-center items-center rounded-lg animate-fade-in  bg-primary-200 w-[200px] h-[200px]">
                    <ImageNotSupportedIcon className="text-primary-600" />
                  </div>
                );
              }
            })()}
            <Typography
              variant="caption"
              className="!text-gray-500 text-center"
            >
              Usa una aplicación de autenticación (p. ej., Google Authenticator o Authy) para escanear este código QR.
            </Typography>
          </div>

          {/* Secret Code */}
          <div className="flex flex-col items-center gap-4 w-full">
            <Typography variant="h6" className="text-center font-semibold">
            O introduce el código secreto manualmente.
            </Typography>
            <div className="flex items-center gap-2 bg-primary-800 p-2 rounded-lg">
              {isDataLoading ? (
                <>
                  <Skeleton variant="text" width={150} height={25} />
                  <Skeleton variant="rounded" width={25} height={25} />
                </>
              ) : secretCode ? (
                <>
                  <Typography variant="body1" className="!font-mono">
                    {secretCode}
                  </Typography>
                  <CopyText text={secretCode} />
                </>
              ) : (
                <>
                  <Typography variant="body1" className="!font-mono uppercase">
                  No disponible
                  </Typography>
                </>
              )}
            </div>
          </div>

          {/* TEST THE CODE */}

          <div className=" mt-4 border-t border-primary-800 pt-2 w-full">
            <div className="flex flex-col w-full justify-start mb-6">
              <Typography
                variant="caption"
                className="!text-primary-400 uppercase"
              >
                Inicia sesión con tu código
              </Typography>
              <Typography variant="body2" className="text-primary-600">
              Introduce el código de verificación de 6 dígitos generado.
              </Typography>
            </div>

            <div className="flex items-center justify-around gap-2">
              <OtpInput
                otp={typeSecret}
                setOtp={(val) => setTypeSecret(val)}
                disabled={!secretCode || isDataLoading}
                isLoading={isCofirming}
                error={otpError}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={confirmCode}
                disabled={typeSecret.length !== 6}
              >
                {isCofirming ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "  Activar"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
