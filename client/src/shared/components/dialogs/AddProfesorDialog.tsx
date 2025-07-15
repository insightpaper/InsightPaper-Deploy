"use client";
import { useEffect, useState } from "react";
import Dialog from "./Dialog";
import { Button, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import addProfesorSchema, {
  FormData,
} from "../../../modules/add-profesor/schema/addProfesorSchema";
// import axios from "axios";
// import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
// import { getErrorMessage } from "@/shared/utils/getErrorMessage";
// import axiosInstance from "@/shared/services/axiosService";
import { useUser } from "@/modules/user/context/UserProvider";

export default function AddProfesorDialog() {
  const { createProfessor } = useUser();
  const [isProfessorCreating, setIsProfessorCreating] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(addProfesorSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  const handleModal = () => {
    setOpenDialog(!openDialog);
  };
  const onSubmit = async (data: FormData) => {
    if (isProfessorCreating) return;
    try {
      setIsProfessorCreating(true);
      await createProfessor(data);
      reset();
      setOpenDialog(!openDialog);
    } catch {
    } finally {
      setIsProfessorCreating(false);
    }
  };

  useEffect(() => {
    if (openDialog) {
      reset();
    }
  }, [openDialog]);

  return (
    <>
      <Button variant="outlined" color="primary" onClick={handleModal}>
        Agregar Profesor
      </Button>
      <Dialog
        header="Agregar Profesor"
        open={openDialog}
        setOpen={setOpenDialog}
      >
        <form
          className="w-full flex flex-col gap-4 animate-fade-in mt-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <Typography variant="caption">Nombre del profesor</Typography>
            <TextField
              {...register("name")}
              required
              id="name"
              placeholder="Nombre"
              type="text"
              error={!!errors.name}
              helperText={errors.name?.message}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Typography variant="caption">Correo electrónico</Typography>
            <TextField
              {...register("email")}
              required
              id="email"
              placeholder="Correo"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <Button
            type="submit"
            variant="outlined"
            disabled={isSubmitting}
            fullWidth
          >
            Agregar profesor
          </Button>
        </form>
      </Dialog>
    </>
  );
}
