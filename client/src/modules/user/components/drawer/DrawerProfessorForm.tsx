"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserFormData, userSchema } from "../../schema/UserSchema";
import {
  Button,
  TextField,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";

//CONTEXT
import { useUser } from "../../context/UserProvider";

interface DrawerCreatorFormProps {
  data: UserFormData;
  onToggleEdit: () => void;
}

export default function DrawerProfessorForm({
  data,
  onToggleEdit,
}: Readonly<DrawerCreatorFormProps>) {
  const { editProfessor } = useUser();
  // Initialize form with default values from `data`
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: data,
  });

  // Handle form submission
  const onSubmit = async (formData: UserFormData) => {
    try {
      await editProfessor(formData);
      reset(); // Reset form when closing
      handleClose();
    } catch {}
  };

  // Open/Close Drawer
  const handleClose = () => {
    onToggleEdit();
  };

  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      <div className="flex items-center justify-between">
        <Typography variant="h6" className="text-primary-400 font-medium">
          Editar información del profesor
        </Typography>
        <div className="flex gap-2 items-center">
          <Button onClick={handleClose} color="error" variant="outlined">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            color="primary"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={25} color="inherit" />
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </div>
      <Divider className="border-primary-600 my-4" />

      {/* Form */}
      <form className="space-y-6 pb-6">
        {/* Personal Information */}
        <div className="bg-primary-800 p-4 rounded-lg shadow-md">
          <Typography
            variant="h6"
            className="text-primary-400 font-medium mb-2"
          >
            Información personal:
          </Typography>
          <Divider className="border-primary-600 mb-3!" />
          <div className="flex flex-col gap-3">
            <TextField
              variant="filled"
              fullWidth
              label="Nombre"
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              variant="filled"
              fullWidth
              label="Correo electrónico"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
