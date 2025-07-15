"use client";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { notifyError } from "@/shared/utils/toastNotify";
import Link from "next/link";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import OtpFormDialog from "@/shared/components/otp/OtpFormDialog";

//AXIOS
import axios from "axios";
import axiosInstance from "@/shared/services/axiosService";

//SCHEME
import loginSchema, { FormData } from "@/modules/login/schemas/loginSchema";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

export default function LoginPage() {
  const router = useRouter();
  const [backDropOpen, setBackDropOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    setIsLoading(true);
    // Call the login API
    try {
      const res = (await axiosInstance.post("/api/users/login", data)) as {
        data: { result: string; doubleFactorEnabled: boolean };
      };
      const { doubleFactorEnabled } = res.data;
      setIs2faEnabled(doubleFactorEnabled);
      setIsOtpOpen(true);
    } catch (error) {
      let errorMessage = "unexpected_error";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error ||
          error.response?.data?.result ||
          errorMessage;
      }
      notifyError(getErrorMessage(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axiosInstance.post("/api/users/verify-otp", {
        email: watch("email"),
        otp,
      });
      handleOtpSuccess();
    } catch (error) {
      let errorMessage = "unexpected_error";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.result ||
          error.response?.data?.error ||
          errorMessage;
      }
      throw new Error(errorMessage);
    }
  };

  const handleOtpSuccess = () => {
    setBackDropOpen(true);
    setTimeout(() => {
      router.push("/");
    }, 1000);
  };

  return (
    <main className="relative !overflow-hidden">
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={backDropOpen}
      >
        <CircularProgress color="primary" />
      </Backdrop>
      <OtpFormDialog
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        handleAction={handleVerifyOtp}
        otp={otp}
        setOtp={setOtp}
        email={watch("email")}
        onSuccess={handleOtpSuccess}
        has2fa={is2faEnabled}
      />
      {/* Main Content */}
      <div className="h-screen bg-black flex items-center justify-center p-0 sm:p-8 ">
        <Card
          variant="outlined"
          className="w-full md:max-w-md lg:max-w-[400px] h-full md:h-fit !rounded-none md:!rounded-lg animate-slide-in z-10"
        >
          <CardContent className="flex flex-col justify-center !py-10 items-center md:justify-stretch h-full w-full">
            <div className="flex flex-col items-center gap-1 mb-6 z-10">
              <Typography variant="h1" className="!text-3xl">
                Te damos la bienvenida
              </Typography>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 mt-2 sm:mt-4 w-full"
            >
              <div className="flex flex-col gap-2">
                <Typography variant="caption">Email</Typography>
                <TextField
                  {...register("email")}
                  id="email"
                  type="text"
                  placeholder="Digite su correo"
                  className="p-2 border border-gray-300 rounded"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Typography variant="caption">Contraseña</Typography>
                <TextField
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder="Digite su contraseña"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  className="p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between ml-auto">
                <Typography
                  variant="caption"
                  className="!text-gray-200 hover:opacity-80 transition-all duration-200 ease-in-out"
                >
                  <Link href="/forgot-password">¿Olvidó su contraseña?</Link>
                </Typography>
              </div>
              <Button type="submit" variant="contained">
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Continuar"
                )}
              </Button>
              <div className="flex items-center justify-between">
                <Typography
                  variant="caption"
                  className="!text-gray-200 hover:opacity-80 transition-all duration-200 ease-in-out"
                >
                  ¿No tienes una cuenta?{" "}
                  <Link
                    href="/create-account"
                    className="text-accent-400 hover:text-accent-500 transition-colors"
                  >
                    Registrarse
                  </Link>
                </Typography>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
