"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import CreateCourseSchema, { FormData } from "../../schema/CreateCourseSchema";
import {
  Button,
  TextField,
  Typography,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";

import { useCourse } from "../../context/CourseProvider";
import RichTextInput from "@/shared/components/inputs/RichTextInput";

interface CourseDrawerFormProps {
  data: FormData;
  onToggleEdit: () => void;
}

export default function CourseDrawerForm({
  data,
  onToggleEdit,
}: Readonly<CourseDrawerFormProps>) {
  const { editCourse } = useCourse();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(CreateCourseSchema),
    defaultValues: data,
  });

  const handleClose = () => {
    onToggleEdit();
  };

  const onSubmit = async (formData: FormData) => {
    try {
      await editCourse({ ...formData, courseId: data.courseId });
      reset(); // Reset form when closing
      handleClose();
    } catch {}
  };

  const handleDescriptionChange = (value: string) => {
    setValue("description", value);
  };

  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      <div className="flex items-center justify-between">
        <Typography variant="h6" className="text-primary-400 font-medium">
          Editar información del curso
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
        <div className="rounded-lg shadow-md">
          <Typography
            variant="h6"
            className="text-primary-400 font-medium mb-2"
          >
            Información del curso:
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
            <Typography variant="caption" className="!mt-2">Descripción:</Typography>
            <RichTextInput
              value={watch("description")}
              onChange={handleDescriptionChange}
            />
            {errors.description && (
              <Typography variant="caption" color="error">
                {errors.description.message}
              </Typography>
            )}
            <Typography variant="caption">Semestre</Typography>
            <Select
              labelId="semester"
              id="semester"
              {...register("semester")}
              error={!!errors.semester}
              value={watch("semester") || ""}
              //   helperText={errors.semester?.message}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
            </Select>
          </div>
        </div>
      </form>
    </div>
  );
}
