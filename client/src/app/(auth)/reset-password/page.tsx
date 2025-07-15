"use client";
import { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import forgotPasswordSchema from "@/modules/forgot-password/schemas/forgotPasswordSchema";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import Logo from "../../../../public/Logo.png";

//AXIOS
import axiosInstance from "@/shared/services/axiosService";
import axios from "axios";

//COMPONENTS
import {
  Card,
  CardContent,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  CircularProgress,
  Backdrop,
} from "@mui/material";

//ICONS
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isPasswordSending, setIsPasswordSending] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  // Password Validation Checks
  const passwordChecks = [
    { text: "Al menos 8 caracteres", valid: newPassword.length >= 8 },
    { text: "Una letra mayúscula", valid: /[A-Z]/.test(newPassword) },
    { text: "Una letra minúscula", valid: /[a-z]/.test(newPassword) },
    { text: "Un número", valid: /\d/.test(newPassword) },
    {
      text: "Un carácter especial (!@#$%^&*()-_=+[]{}|\\;:'\",<.>/?)",
      valid: /[!@#$%^&*()\-_=\+\[\]{}|\\;:'",<.>\/?]/.test(newPassword),
    },
  ];

  const handleSubmit = async () => {
    if (isPasswordSending) return;
    const result = forgotPasswordSchema.shape.password.safeParse(newPassword);
    if (!result.success) {
      setError(result.error.errors?.[0].message);
      return;
    }
    try {
      setIsPasswordSending(true);
      await axiosInstance.post("/api/users/confirm-password-recovery", {
        token,
        newPassword,
      });
      setIsCompleted(true);
      notifySuccess("Contraseña cambiada con éxito");

      setTimeout(() => {
        setIsRedirecting(true);
      }, 3000);
      setTimeout(() => {
        router.replace("/login");
      }, 3000);
    } catch (error) {
      let errorMessage = "unexpected_error";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.result ||
          error.response?.data?.error ||
          errorMessage;
      }
      notifyError(getErrorMessage(errorMessage));
      if (errorMessage === "token_expired" || errorMessage === "token_used") {
        setIsRedirecting(true);
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      }
    } finally {
      setIsPasswordSending(false);
    }
  };

  return (
    <div className="relative !overflow-hidden">
      {/* Blur Circle */}
      <div className=" block absolute bottom-0 translate-y-1/2 translate-x-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-accent-900  blur-[200px]  animate-fade-in" />
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={isRedirecting}
      >
        <CircularProgress color="primary" />
      </Backdrop>
      {/* Main Content */}
      <div className="h-screen bg-black flex items-center justify-center p-0 sm:p-8 ">
        <Card
          variant="outlined"
          className="!relative w-full md:max-w-md lg:max-w-lg h-full md:h-fit !rounded-none lg:!rounded-lg animate-slide-in z-10 !my-4"
        >
          <div className="absolute -top-24 left-0 w-[100px] h-[100px] sm:w-[200px] sm:h-[200px] bg-accent-500 opacity-30 blur-[50px] sm:blur-[100px]" />
          {isCompleted ? (
            <CardContent className="flex flex-col py-1 justify-center items-center md:justify-stretch h-full w-full">
              <div className="flex flex-col items-center gap-1 mb-4 z-10 w-full">
                <div className="flex flex-col items-center !mb-6">
                  <Image
                    className="mb-2"
                    alt="insight paper"
                    src={Logo}
                    width={100}
                    height={100}
                  />
                </div>
                <div className="flex flex-col gap-4 animate-fade-in">
                  <Typography
                    variant="h3"
                    className="!font-bold text-center !text-xl sm:!text-3xl"
                  >
                    Bienvenido de vuelta!
                  </Typography>
                  <Typography
                    variant="h6"
                    className="text-center !my-6 text-lg sm:text-xl"
                  >
                    Contraseña cambiada con éxito!
                  </Typography>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col py-1 justify-center items-center md:justify-stretch h-full w-full">
              <div className="flex flex-col items-center gap-1 mb-4 z-10 w-full">
                <div className="flex flex-col items-center !mb-6">
                  <Image
                    className="mb-2"
                    alt="insight paper"
                    src={Logo}
                    width={100}
                    height={100}
                    // layout="responsive"
                  />

                  <Typography
                    variant="h3"
                    className="!font-bold text-center !text-xl sm:!text-3xl"
                  >
                    ¡Ya casi estás ahí!
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    className="!text-primary-400 text-center !text-sm sm:!text-base"
                  >
                    Sigue las instrucciones a continuación:
                  </Typography>
                </div>
              </div>
              <div className="w-full  ">
                <div className="w-full flex flex-col gap-4 animate-fade-in  ">
                  <Typography variant="subtitle1">
                    Ingresa tu nueva contraseña
                  </Typography>
                  <TextField
                    label="Nueva contraseña"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    error={Boolean(error)}
                    helperText={error}
                  />

                  <div>
                    <Typography variant="subtitle1">
                      Tu nueva contraseña debe cumplir con los siguientes:
                    </Typography>
                    <List dense sx={{ color: "gray" }}>
                      {passwordChecks.map((rule, index) => (
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

                  <Button variant="outlined" fullWidth onClick={handleSubmit}>
                    {isPasswordSending ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Cambiar"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
