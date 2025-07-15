"use client";
import Dialog from "./Dialog";
import { TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useCourse } from "@/modules/courses/context/CourseProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import joinCourseSchema, {
  JoinCourseFormData,
} from "@/modules/courses/schema/JoinCourseSchema";
import { Button, CircularProgress } from "@mui/material";
import { useEffect } from "react";

interface JoinCourseDialogProps {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
}

export default function JoinCourseDialog({
  openDialog,
  setOpenDialog,
}: JoinCourseDialogProps) {
  const { joinCourse } = useCourse()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JoinCourseFormData>({
    resolver: zodResolver(joinCourseSchema),
    defaultValues: {
      courseCode: "",
    },
  });

  const onSubmit = async (data: JoinCourseFormData) => {
    if (isSubmitting) return
    try {
      await joinCourse(data)
       reset()
       setOpenDialog(!openDialog)
    } catch {
    } finally {
    }
  }

  useEffect(() => {
    if (openDialog) {
      reset();
    }
  }, [openDialog]);
  return (
    <Dialog
      header="Unirse a un curso"
      open={openDialog}
      setOpen={setOpenDialog}
      className="mx-auto max-w-sm"
    >
      <form className="w-full flex flex-col gap-4 animate-fade-in" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2 my-3">
          <Typography variant="caption">Ingresa el código del curso</Typography>
          <TextField
            label="Código del curso"
            {...register("courseCode")}
            error={!!errors.courseCode}
            helperText={errors.courseCode?.message}
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={isSubmitting && <CircularProgress size={16} />}
        >
          Unirse
        </Button>
      </form>
    </Dialog>
  );
}
