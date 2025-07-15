"use client";
import { useRouter } from "next-nprogress-bar";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import Link from "next/link";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

//AXIOS
import axios from "axios";
import axiosInstance from "@/shared/services/axiosService";

//SCHEME
import createAccountSchema, {
  FormData,
} from "@/modules/create-account/schemas/createAccountSchema";

export default function CreateAccountPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      email: "",
      name: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    setIsLoading(true);
    // Call the create account API
    try {
      const res = await axiosInstance.post(
        "/api/users/student/create-user",
        data
      );
      console.log(res.data.result);
      notifySuccess("Cuenta creada exitosamente");
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      console.log(error)
      let errorMessage = "unexpected_error";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error ||
          error.response?.data?.result ||
          errorMessage;
      }
      notifyError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative !overflow-hidden">
      {/* Main Content */}
      <div className="h-screen bg-black flex items-center justify-center p-0 sm:p-8 ">
        <Card
          variant="outlined"
          className="w-full md:max-w-md lg:max-w-[400px] h-full md:h-fit !rounded-none md:!rounded-lg animate-slide-in z-10"
        >
          <CardContent className="flex flex-col justify-center !py-10 items-center md:justify-stretch h-full w-full">
            <div className="flex flex-col items-center gap-1 mb-6 z-10">
              <Typography variant="h1" className="!text-3xl">
                Crear una cuenta
              </Typography>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4 mt-2 sm:mt-4 w-full"
            >
              <div className="flex flex-col gap-2">
                <Typography variant="caption">Correo electrónico</Typography>
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
                <Typography variant="caption">Nombre</Typography>
                <TextField
                  {...register("name")}
                  id="name"
                  type="text"
                  placeholder="Digite su nombre"
                  className="p-2 border border-gray-300 rounded"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Typography variant="caption">Contraseña</Typography>
                <TextField
                  {...register("newPassword")}
                  id="password"
                  type="password"
                  placeholder="Digite su contraseña"
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
                  Ya tienes una cuenta?{" "}
                  <Link
                    href="/login"
                    className="text-accent-400 hover:text-accent-500 transition-colors"
                  >
                    Iniciar Sesión
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
