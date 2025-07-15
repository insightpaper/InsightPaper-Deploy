import React, { useState } from "react";
import {
  CircularProgress,
  Typography,
  Divider,
  Chip,
  Collapse,
  IconButton,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  IntProfessorDetails,
  ProfessorStats,
} from "../../interfaces/ProfessorDetails";
import { formatSimpleDate } from "@/shared/utils/date/dateFormatter";

interface CreatorDrawerContentProps {
  data: IntProfessorDetails;
  stats: ProfessorStats | null;
  isDataLoading?: boolean;
}

export default function ProfessorDrawerContent({
  data,
  stats,
  isDataLoading,
}: CreatorDrawerContentProps) {
  const [openCourses, setOpenCourses] = useState(false);
  const [openDocuments, setOpenDocuments] = useState(false);
  const [openStudents, setOpenStudents] = useState(false);

  if (isDataLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-6">
        <CircularProgress size={45} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Información personal */}
      <div className="bg-primary-800 p-4 rounded-lg shadow-md">
        <Typography variant="h6" className="text-primary-400 font-medium mb-2">
          Información personal:
        </Typography>
        <Divider className="border-primary-600 mb-3!" />
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-2">
            <Typography variant="subtitle2" className="text-primary-300">
              Nombre:
            </Typography>
            <Typography variant="body2">
              {data.professorName || "No name provided."}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-primary-300">
              Correo electrónico:
            </Typography>
            <Typography variant="body2">
              {data.professorEmail || "No email provided."}
            </Typography>
          </div>
        </div>
      </div>

      {/* Estadísticas del profesor */}
      {stats && (
        <section className="bg-primary-800 p-4 rounded-lg shadow-md">
          <Typography
            variant="h6"
            className="text-primary-400 font-medium mb-2"
          >
            Estadísticas generales
          </Typography>
          <Divider className="border-primary-600 mb-3!" />
          <div className="grid grid-cols-2 gap-3 text-primary-300 text-sm [&>div]:flex [&>div]:gap-2">
            <div>
              <Typography variant="subtitle2">Comentarios públicos:</Typography>
              <Typography variant="body2">{stats.publicComments}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2">Comentarios privados:</Typography>
              <Typography variant="body2">{stats.privateComments}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2">
                Evaluaciones realizadas:
              </Typography>
              <Typography variant="body2">{stats.evaluations}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2">Cursos asignados:</Typography>
              <Typography variant="body2">{stats.courses}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2">Documentos cargados:</Typography>
              <Typography variant="body2">{stats.documentsUploaded}</Typography>
            </div>
            <div>
              <Typography variant="subtitle2">
                Estudiantes inscritos:
              </Typography>
              <Typography variant="body2">{stats.students}</Typography>
            </div>
          </div>

          {stats.studentsPerCourse && stats.studentsPerCourse.length > 0 && (
            <>
              <Divider className="border-primary-600 my-3!" />
              <Typography variant="subtitle2" className="text-primary-300 mb-2!">
                Estudiantes por curso:
              </Typography>
              <ul className="list-disc ml-5 text-primary-300 text-sm">
                {stats.studentsPerCourse.map((item, index) => (
                  <li key={index}>
                    {item.courseName}: {item.studentCount} estudiante
                    {item.studentCount !== 1 && "s"}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Cursos */}
      {data.courses && data.courses.length > 0 && (
        <section className="bg-primary-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <Typography
              variant="h6"
              className="text-primary-400 font-medium mb-2"
            >
              Cursos asignados ({data.courses.length})
            </Typography>
            <IconButton
              onClick={() => setOpenCourses(!openCourses)}
              size="small"
            >
              {openCourses ? (
                <ExpandLess className="text-primary-400" />
              ) : (
                <ExpandMore className="text-primary-400" />
              )}
            </IconButton>
          </div>
          <Divider className="border-primary-600 mb-3!" />
          <Collapse in={openCourses}>
            <div className="flex flex-col gap-3">
              {data.courses.map((course) => (
                <div
                  key={course.courseId}
                  className="bg-primary-900 p-3 rounded-md"
                >
                  <Typography
                    variant="subtitle1"
                    className="text-primary-300 font-semibold"
                  >
                    {course.courseName}
                  </Typography>
                  <Typography variant="body2" className="text-primary-400!">
                    Semestre: {course.courseSemester}
                  </Typography>
                  <Typography variant="body2" className="text-primary-400!">
                    Creado: {formatSimpleDate(course.courseCreatedDate)}
                  </Typography>
                  <Typography variant="body2" className="text-primary-400!">
                    Última modificación:{" "}
                    {formatSimpleDate(course.courseModifiedDate)}
                  </Typography>
                </div>
              ))}
            </div>
          </Collapse>
        </section>
      )}

      {/* Documentos */}
      {data.documents && data.documents.length > 0 && (
        <section className="bg-primary-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <Typography
              variant="h6"
              className="text-primary-400 font-medium mb-2"
            >
              Documentos cargados ({data.documents.length})
            </Typography>
            <IconButton
              onClick={() => setOpenDocuments(!openDocuments)}
              size="small"
            >
              {openDocuments ? (
                <ExpandLess className="text-primary-400" />
              ) : (
                <ExpandMore className="text-primary-400" />
              )}
            </IconButton>
          </div>
          <Divider className="border-primary-600 mb-3!" />
          <Collapse in={openDocuments}>
            <div className="flex flex-col gap-3">
              {data.documents.map((doc) => (
                <div
                  key={doc.documentId}
                  className="bg-primary-900 p-3 rounded-md"
                >
                  <Typography
                    variant="subtitle2"
                    className="text-primary-300 font-semibold"
                  >
                    {doc.documentTitle}
                  </Typography>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {JSON.parse(doc.documentLabels).map(
                      (label: string, idx: number) => (
                        <Chip
                          key={idx}
                          label={label}
                          size="small"
                          className="bg-primary-600 text-white"
                        />
                      )
                    )}
                  </div>
                  {doc.documentFirebaseUrl && (
                    <a
                      href={doc.documentFirebaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 underline text-sm mt-1 inline-block"
                    >
                      Ver documento
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Collapse>
        </section>
      )}

      {/* Estudiantes */}
      {data.students && data.students.length > 0 && (
        <section className="bg-primary-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <Typography
              variant="h6"
              className="text-primary-400 font-medium mb-2"
            >
              Estudiantes inscritos ({data.students.length})
            </Typography>
            <IconButton
              onClick={() => setOpenStudents(!openStudents)}
              size="small"
            >
              {openStudents ? (
                <ExpandLess className="text-primary-400" />
              ) : (
                <ExpandMore className="text-primary-400" />
              )}
            </IconButton>
          </div>
          <Divider className="border-primary-600 mb-3!" />
          <Collapse in={openStudents}>
            <table className="table-auto w-full text-left text-primary-300 text-xs!">
              <thead>
                <tr>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">Correo Electrónico</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((student, index) => (
                  <tr
                    key={student.studentId}
                    className={
                      index % 2 === 0 ? "bg-primary-900" : "bg-primary-800"
                    }
                  >
                    <td className="px-4 py-2">{student.studentName}</td>
                    <td className="px-4 py-2">{student.studentEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Collapse>
        </section>
      )}
    </div>
  );
}
