import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  DialogContentText,
  CircularProgress,
  Alert,
} from "@mui/material";
import OtpInput from "@/shared/components/otp/OtpInput";
import OtpReSend from "./OtpReSend";

interface OtpFormDialogProps {
  email: string;
  otp: string;
  setOtp: (otp: string) => void;
  isOpen: boolean;
  handleAction: () => Promise<void>;
  onClose: () => void;
  onSuccess: () => void;
  has2fa?: boolean;
}

export default function OtpFormDialog({
  email,
  otp,
  setOtp,
  isOpen,
  handleAction,
  onClose,
  onSuccess,
  has2fa,
}: Readonly<OtpFormDialogProps>) {
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await handleAction();
      onClose();
      onSuccess();
    } catch {
      setOtpError(true);
      setError("Invalid OTP");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setOtpError(false);
      }, 500);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setError("");
    }
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        className: " border border-accent-800 !shadow-xl !shadow-accent-900 ",
        elevation: 0,
        component: "form",
      }}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div
        className={`absolute -top-0 w-[100px] h-[50px] rounded-full  !bg-accent-500  blur-3xl`}
      />
      <DialogTitle className=" !text-accent-500 !font-semibold z-10">Verificar código</DialogTitle>
      <DialogContent className="z-10">
        {error && (
          <Alert severity="error" className="mb-2">
            {error}
          </Alert>
        )}
        {has2fa ? (
          <DialogContentText className="flex flex-col items-start !mb-4">
            Por favor, ingrese el código de verificación de su aplicación autenticadora.
          </DialogContentText>
        ) : (
          <DialogContentText className="flex flex-col items-start !mb-4">
            Por favor, ingrese el código de verificación que hemos enviado a su correo electrónico.{" "}
            <OtpReSend email={email} />
          </DialogContentText>
        )}
        <OtpInput
          otp={otp}
          setOtp={setOtp}
          isLoading={isLoading}
          error={otpError}
          disabled={isLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={isLoading || otp.length < 6}>
          {isLoading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Verificar"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
