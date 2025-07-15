"use client";
import { useState } from "react";
import {
  IconButton,
  Typography,
  DrawerProps as MuiDrawerProps,
  CircularProgress,
} from "@mui/material";

import DrawerButton from "@/shared/components/drawer/DrawerButton";
import StudentCourseDrawerContent from "./StudentCourseDrawerContent";

//ICONS
import CloseIcon from "@mui/icons-material/Close";
//UTILS
import { apiRequest } from "@/shared/utils/request/apiRequest";

//INTERFACE
import { StudentCourseFormData } from "../../schema/StudentCourseSchema";
import { notifyError } from "@/shared/utils/toastNotify";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { useStudensCourse } from "../../context/StudentsCourseProvider";
import { StudentActivityStats } from "../../interfaces/Statistics";
interface DrawerStudentCourseProps extends MuiDrawerProps {
  data: StudentCourseFormData;
}

export default function DrawerStudentCourse({
  data,
  ...muiDrawerProps
}: Readonly<DrawerStudentCourseProps>) {
  const { courseId } = useStudensCourse();
  const [isOpen, setIsOpen] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [student, setStudent] = useState<StudentCourseFormData | null>(null);
  const [stats, setStats] = useState< StudentActivityStats | null>(null);

  const handleClose = () => {
    setIsOpen(false);
  };

  const getStudent = async () => {
    if (!data?.userId) return;
    setIsDataLoading(true);
    try {
      const res = await apiRequest<StudentCourseFormData>({
        method: "get",
        url: `/api/users/id/${data?.userId}`,
      });
      
      setStudent(res);

      const result = await apiRequest<StudentActivityStats>({
        method: "get",
        url: `/api/courses/studentActivity/${data?.userId}/${courseId}`,
      });
      setStats(result);
    } catch (error) {
      console.log("Error al obtener el estudiante", error);
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };

  return (
    <DrawerButton
      tooltip="Mostrar detalles del estudiante"
      {...muiDrawerProps}
      isOpen={isOpen}
      setIsOpen={(e) => {
        if (e) getStudent();
        setIsOpen(e);
      }}
      onClose={handleClose}
      header={
        <>
          <IconButton onClick={handleClose} className="text-secondary!">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className="grow text-center">
            Detalles del estudiante
          </Typography>
        </>
      }
    >
      {isDataLoading ? (
        <div className="flex justify-center items-center h-full">
          <CircularProgress color="primary" />
        </div>
      ) : (
        student && (
          <StudentCourseDrawerContent
            data={student}
            stats={stats}
            isDataLoading={isDataLoading}
          />
        )
      )}
    </DrawerButton>
  );
}
