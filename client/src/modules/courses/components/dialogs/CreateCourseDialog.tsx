"use client";
import Dialog from "@/shared/components/dialogs/Dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import CreateCourseSchema, { FormData } from "../../schema/CreateCourseSchema";
import { useCourse } from "../../context/CourseProvider";
import RichTextInput from "@/shared/components/inputs/RichTextInput";

export default function CreateCourseDialog() {
  const { createCourse } = useCourse();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleDialog = () => setOpen(!open);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(CreateCourseSchema),
    defaultValues: {
      name: "",
      description: "",
      semester: 1,
    },
  });

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      await createCourse(data);
      setOpen(false);
      reset();
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setValue("description", value);
  };

  return (
    <>
      <Button variant="outlined" onClick={toggleDialog}>
        Crear curso
      </Button>
      <Dialog header="Crear curso" open={open} setOpen={toggleDialog} >
        <form
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <Typography variant="caption">Nombre del curso</Typography>
            <TextField
              {...register("name")}
              required
              id="name"
              placeholder="Digite el nombre del curso"
              type="text"
              error={!!errors.name}
              helperText={errors.name?.message}
              className="p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Typography variant="caption">Descripción del curso</Typography>
            <RichTextInput
              value={watch("description")}
              onChange={handleDescriptionChange}
            />
            {errors.description && (
              <Typography variant="caption" color="error">
                {errors.description.message}
              </Typography>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Typography variant="caption">Semestre</Typography>
            <Select
              labelId="semester"
              id="semester"
              {...register("semester")}
              error={!!errors.semester}
              value={watch("semester")}

              //   helperText={errors.semester?.message}
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
            </Select>
          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={20} /> : "Crear"}
          </Button>
        </form>
      </Dialog>
    </>
  );
}
