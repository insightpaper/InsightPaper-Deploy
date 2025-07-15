"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import Dialog from "./Dialog";
import ConfirmationDialog from "./ConfirmationDialog";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import axios from "axios";

//ICONS
import PersonIcon from "@mui/icons-material/Person";

// Importing Schema and Types
import { UserData, userDataSchema } from "@/shared/interfaces/UserData";
import axiosInstance from "@/shared/services/axiosService";

interface EditUserDialogProps {
  setOpen: (open: boolean) => void;
  open: boolean;
  userId: string;
  fetchUsers: () => void;
}

export default function EditUserDialog({
  setOpen,
  open,
  userId,
  fetchUsers,
}: EditUserDialogProps) {
  const [isWarning, setIsWarning] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Hook form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, touchedFields },
  } = useForm<UserData>({
    resolver: zodResolver(userDataSchema),
  });

  // Form Submission
  const onSubmit = async (data: UserData) => {
    console.log(data);
    try {
      const res = await axiosInstance.put(`/api/users/update`, { ...data, userId: userId });
      console.log(res);
      if (res.status === 200) {
        notifySuccess('Usuario actualizado exitosamente');
        fetchUsers();
        setOpen(false);
      } else {
        console.log(res.data.error);
        notifyError(getErrorMessage(res.data.error));
      }
    } catch (error) {
      console.log(error);
      let errorMessage = "unexpected_error";
      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.error ||
          error.response?.data?.result ||
          errorMessage;
      }
      notifyError(getErrorMessage(errorMessage));
    }
  };
  
  useEffect(() => {
    const getUserData = async () => {
      try {
        setIsDataLoading(true);
        const res = await axiosInstance.get(`/api/users/id/${userId}`);
        console.log(res);
        if (res.status !== 200) {
          notifyError(getErrorMessage(res.data.error));
          return;
        }
        const result = res.data.result;
        reset(result);
      } catch (error) {
        console.log(error);
        let errorMessage = "unexpected_error";
        if (axios.isAxiosError(error)) {
          errorMessage =
            error.response?.data?.error ||
            error.response?.data?.result ||
            errorMessage;
        }
        notifyError(getErrorMessage(errorMessage));
      } finally {
        setIsDataLoading(false);
      }
    };
    if (open) {
      getUserData();
    }
  }, [open]);

  const handleOpen = (open: boolean) => {
    if (!open && (isDirty || Object.keys(touchedFields).length > 0)) {
      setIsWarning(true);
      return;
    }
    setOpen(open);
  };

  return (
    <>
      <ConfirmationDialog
        cancelText="Cancelar"
        confirmText="Aceptar"
        content="Esta seguro de que desea terminar la edicion? "
        title="Advertencia"
        isPositiveAction={false}
        isOpen={isWarning}
        onCancel={() => setIsWarning(false)}
        onConfirm={() => {
          setIsWarning(false);
          setOpen(false);
          reset();
        }}
      />

      <Dialog
        open={open}
        setOpen={handleOpen}
        header={
          <span className="flex items-center gap-2">
            <PersonIcon />
            Editar usuario
          </span>
        }
      >
        {isDataLoading ? (
          <div className="flex justify-center items-center h-32">
            <CircularProgress />
          </div>
        ) : (
          <form
            className="w-full flex flex-col gap-4 animate-fade-in mt-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Name */}
            <div>
              <Typography variant="caption">Nombre</Typography>
              <TextField
                {...register("name")}
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                className='p-2 border border-gray-300 rounded'
              />
            </div>

            {/* Email */}
            <div>
              <Typography variant="caption">Email</Typography>
              <TextField
                {...register("email")}
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                className='p-2 border border-gray-300 rounded'
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={25} color="inherit" />
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </form>
        )}
      </Dialog>
    </>
  );
}
