"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  IconButton,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import Dialog from "../dialogs/Dialog";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";

//ICONS
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";

//CONTEXT
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";

//API
import { apiRequest } from "@/shared/utils/request/apiRequest";

// Importing Schema and Types
import { UserData, userDataSchema } from "@/shared/interfaces/UserData";

interface EditAdminUserDialogProps {
  className?: string;
}

export default function EditUserDialog({
  className,
}: Readonly<EditAdminUserDialogProps>) {
  const { setCurrentUserData, currentUserData } = useSystemLayout();
  const [isWarning, setIsWarning] = useState(false);
  const [open, setOpen] = useState(false);
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
    try {
      await apiRequest({
        method: "put",
        url: `/api/users/update`,
        data: { ...data, userId: currentUserData?.userId },
      });
      setCurrentUserData({ ...currentUserData, ...data } as UserData);
      notifySuccess("Usuario actualizado correctamente");
      setOpen(false);
    } catch (error) {
      console.log(error)
      notifyError("Algo ha salido mal");
    }
  };

  useEffect(() => {
    const getAdminData = async () => {
      try {
        setIsDataLoading(true);
        const result = await apiRequest<UserData>({
          method: "get",
          url: `/api/users/id/${currentUserData?.userId}`,
        });
        reset(result);
      } catch (error) {
        console.log(error)
        notifyError("Algo ha salido mal");
      } finally {
        setIsDataLoading(false);
      }
    };
    if (open) {
      console.log(currentUserData)
      getAdminData();
    }
  }, [open, currentUserData?.userId]);

  const handleOpen = (open: boolean) => {
    if (!open && (isDirty || Object.keys(touchedFields).length > 0)) {
      setIsWarning(true);
      return;
    }
    setOpen(open);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={() => setOpen(true)}
        className={className}
      >
        <EditIcon fontSize="small" className="!text-base" />
      </IconButton>

      <ConfirmationDialog
        cancelText="Cancelar"
        confirmText="Confirmar"
        content="¿Estás seguro de que deseas salir sin guardar los cambios?"
        title="Salir sin guardar"
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
            Editar mi usuario
          </span>
        }
      >
        {isDataLoading ? (
          <div className="flex justify-center items-center h-32">
            <CircularProgress />
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
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
              />
            </div>

            {/* Email */}
            <div>
              <Typography variant="caption">Correo electrónico</Typography>
              <TextField
                {...register("email")}
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
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
                "Guardar cambios"
              )}
            </Button>
          </form>
        )}
      </Dialog>
    </>
  );
}
