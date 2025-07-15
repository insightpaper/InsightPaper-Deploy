"use client";
import { useRouter } from "next-nprogress-bar";
import React, { useState } from "react";
import Link from "next/link";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import axiosInstance from "@/shared/services/axiosService";
import forgotPasswordSchema from "@/modules/forgot-password/schemas/forgotPasswordSchema";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export default function ForgotPassword() {
  const router = useRouter();
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // Validate email before sending request
    const result = forgotPasswordSchema.shape.email.safeParse(email);
    if (!result.success) {
      setError(result.error.errors?.[0].message);
      return;
    }

    if (isEmailSending) return;

    setIsEmailSending(true);

    try {
      await axiosInstance.post("/api/users/request-password-recovery", {
        email,
      });
      setIsEmailSent(true);
      notifySuccess("Email sent successfully");
      setTimeout(() => {
        router.push("/login");
      }, 30000);
    } catch (error) {
      let errorMessage = "unexpected_error";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.result ||
          error.response?.data?.error ||
          errorMessage;
      }
      notifyError(getErrorMessage(errorMessage));
    } finally {
      setIsEmailSending(false);
    }
  };

  return (
    <div className="relative !overflow-hidden">
      {/* Background Blur Effect */}
      {/* Main Content */}
      <div className="h-screen bg-black flex items-center justify-center p-0 sm:p-8">
        <Card
          variant="outlined"
          className="!relative w-full md:max-w-md lg:max-w-lg h-full md:h-fit !rounded-none lg:!rounded-lg animate-slide-in z-10 !my-4"
        >
          <div className="absolute -top-24 left-0 w-[100px] h-[100px] sm:w-[200px] sm:h-[200px] bg-accent-500 opacity-30 blur-[50px] sm:blur-[100px]" />
          {isEmailSent ? (
            <CardContent className="flex flex-col py-1 justify-center items-center md:justify-stretch h-full w-full">
              {" "}
              <div className="w-full flex flex-col gap-4 my-4 animate-fade-in">
                <div className="flex flex-col items-center gap-4">
                  <Typography variant="h6" color="primary">
                    Correo enviado exitosamente!
                  </Typography>
                  <Typography variant="body1" className="text-center text-pretty">
                    Por favor revise su bandeja de entrada para obtener más
                    instrucciones.
                  </Typography>
                  {/* Back to Login Link */}
                  <Typography
                    variant="caption"
                    className="!text-accent-500 hover:opacity-90 transition-all duration-200 ease-in-out"
                  >
                    <Link
                      href="/login"
                      className="text-accent-500 hover:underline"
                    >
                      Volver al inicio de sesión
                    </Link>
                  </Typography>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col py-1 justify-center items-center md:justify-stretch h-full w-full">
              {/* Header Section */}
              <div className="flex flex-col items-center gap-1 z-10 w-full">
                <div className="flex flex-col !mb-6">
                  <Typography
                    variant="h3"
                    className="text-left !text-xl sm:!text-2xl !mb-2"
                  >
                    Recuperación de contraseña
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    className="!text-primary-400 text-left !text-sm text-pretty"
                  >
                    Ingrese el correo electrónico de la cuenta a la que intenta
                    ingresar. A este mismo correo se le enviara un link para que
                    pueda restablecer su contraseña.
                  </Typography>
                </div>
              </div>

              {/* Email Input Form */}
              <div className="w-full flex flex-col gap-4 mb-4 animate-fade-in">
                <Typography variant="subtitle1" className="!text-sm">
                  Ingrese su correo electrónico
                </Typography>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(error)}
                  helperText={error}
                />
                <div className="flex gap-2">
                  <Button variant="outlined" fullWidth onClick={handleSubmit}>
                    {isEmailSending ? <CircularProgress size={24} /> : "Enviar"}
                  </Button>
                </div>
              </div>
              {/* Back to Login Link */}

              <Typography
                variant="caption"
                className="!text-accent-500 hover:opacity-90 transition-all duration-200 ease-in-out"
              >
                <Link
                  href="/login"
                  className="text-accent-500 hover:!opacity-80"
                >
                  Volver al inicio de sesión
                </Link>
              </Typography>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
