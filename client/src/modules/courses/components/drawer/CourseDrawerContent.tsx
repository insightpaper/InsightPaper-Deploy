"use client";
import "@/shared/styles/tiptap.css";
import CopyText from "@/shared/components/CopyText";
import { CourseFormData } from "../../schema/CourseSchema";
import { Button, Divider, Typography, CircularProgress } from "@mui/material";
import Link from "next/link";
import DOMPurify from "dompurify";

interface CourseDrawerContentProps {
  data: CourseFormData;
  isDataLoading?: boolean;
}

export default function CourseDrawerContent({
  data,
  isDataLoading,
}: CourseDrawerContentProps) {
  if (isDataLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-6">
        <CircularProgress size={45} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Course Info */}
      <div className="bg-primary-800 p-4 rounded-lg shadow-md">
        <Typography variant="h6" className="text-primary-400 font-medium mb-2">
          Información del curso:
        </Typography>{" "}
        <Divider className="border-primary-600 mb-3!" />
        <div className="grid grid-cols-1 gap-3">
          <Typography variant="subtitle2" className="text-primary-300">
            Nombre:
          </Typography>
          <Typography variant="body2">
            {data.name || "Nombre no disponible"}
          </Typography>
          <Typography variant="body2" className="text-primary-300">
            Descripción:
          </Typography>
          {data?.description ? (
            <div
              className="tiptap ProseMirror text-primary-200"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(data.description),
              }}
            />
          ) : "Descripción no disponible"}
          <Typography variant="body2" className="text-primary-300">
            Semestre:
          </Typography>

          <Typography variant="body2">
            {data.semester || "Semestre no disponible"}
          </Typography>
          <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-primary-300">
              Codigo:
            </Typography>
            <div className="bg-primary-900 p-2 rounded-lg">
              {data.code ? (
                <Typography
                  variant="body1"
                  className="!font-mono flex gap-2 items-center"
                >
                  {data.code}
                  <CopyText text={data.code.toString()} />
                </Typography>
              ) : (
                <Typography variant="body1" className="!font-mono ">
                  No disponible
                </Typography>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons For Students and Stats */}
      <div className="flex flex-col gap-4 p-6">
        <Link href={`/courses/${data.courseId}/students`} className="w-full">
          <Button variant="outlined" className="w-full">
            Lista de estudiantes
          </Button>
        </Link>
        <Button variant="outlined">Estadisticas del curso</Button>
      </div>
    </div>
  );
}
