import React from "react";
import { CircularProgress, Typography, Divider } from "@mui/material";
import Link from "next/link";

//INTERFACE
import { StudentCourseFormData } from "../../schema/StudentCourseSchema";
import { StudentActivityStats } from "../../interfaces/Statistics";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

const darkTooltip = {
  contentStyle: {
    backgroundColor: "#1f2937",
    border: "1px solid #4b5563",
    borderRadius: "8px",
    color: "#e5e7eb",
    fontSize: "14px",
  },
  itemStyle: {
    color: "#d1d5db",
  },
};

const darkLegend = {
  wrapperStyle: {
    color: "#d1d5db",
  },
};

interface CreatorDrawerContentProps {
  data: StudentCourseFormData;
  stats: StudentActivityStats | null;
  isDataLoading?: boolean;
}

export default function StudentCourseDrawerContent({
  data,
  stats,
  isDataLoading,
}: CreatorDrawerContentProps) {
  if (isDataLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-6">
        <CircularProgress size={45} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* User Info */}
      <div className="bg-primary-800 p-4 rounded-lg shadow-md">
        <Typography variant="h6" className="text-primary-400 font-medium mb-2!">
          Información personal:
        </Typography>{" "}
        <Divider className="border-primary-600 mb-3!" />
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-2">
            <Typography variant="subtitle2" className="text-primary-300">
              Nombre:
            </Typography>
            <Typography variant="body2">
              {data.name || "No name provided."}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-primary-300">
              Correo electrónico:
            </Typography>
            <Typography variant="body2">
              {data.email || "No email provided."}
            </Typography>
          </div>
          {/* Metemos los placeholders para las estadisticas como*/}
          <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-primary-300">
              Documentos revisados:
            </Typography>
            <Typography variant="body2">
              {stats?.generalStats.documentsViewed || "Sin datos."}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-primary-300">
              Número de chats:
            </Typography>
            <Typography variant="body2">
              {stats?.generalStats.numberOfChats || "Sin datos."}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-primary-300">
              Número de preguntas:
            </Typography>
            <Typography variant="body2">
              {stats?.generalStats.numberOfQuestions || "Sin datos."}
            </Typography>
          </div>
          <div className="flex items-center gap-2">
            <Typography variant="body2" className="text-primary-300">
              Número de respuestas:
            </Typography>
            <Typography variant="body2">
              {stats?.generalStats.numberOfResponses || "Sin datos."}
            </Typography>
          </div>
        </div>
      </div>
      {/* Document Stats Bar Chart */}
      <div className="w-full h-96">
        <h2 className="text-lg text-white font-semibold mb-4">
          Interacciones por documento
        </h2>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats?.documentsStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="title" stroke="#e5e7eb" style={{ fontSize: 12 }}  />
            <YAxis stroke="#e5e7eb" style={{ fontSize: 12 }}/>
            <Tooltip {...darkTooltip} />
            <Legend {...darkLegend} />
            <Bar
              dataKey="questions"
              fill="#7244eb"
              name="Preguntas"
            />
            <Bar
              dataKey="responses"
              fill="#9977e6"
              name="Respuestas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline Line Chart */}
      <div className="w-full h-96 mt-14 mb-14">
        <h2 className="text-lg text-white font-semibold mb-4">
          Actividad por fecha
        </h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats?.activityTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis dataKey="activityDate" stroke="#e5e7eb" style={{ fontSize: 12 }} />
            <YAxis stroke="#e5e7eb" style={{ fontSize: 12 }}/>
            <Tooltip {...darkTooltip} />
            <Legend {...darkLegend} />
            <Line
              type="monotone"
              dataKey="questions"
              stroke="#7244eb"
              name="Preguntas"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="responses"
              stroke="#9977e6"
              name="Respuestas"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-primary-800 p-4 rounded-lg shadow-md">
        <Typography variant="h6" className="text-primary-400 font-medium mb-2!">
          Actividad en documentos:
        </Typography>{" "}
        <Divider className="border-primary-600 mb-3!" />
        <div className="grid grid-cols-1 gap-3">
          {stats?.documentsStats.map((doc) => (
            <div
              key={doc.documentId}
              className="flex items-start bg-primary-900 hover:bg-primary-950 rounded-lg p-5 flex-col gap-2"
            >
              <Typography
                variant="body2"
                className="text-primary-200 font-semibold!"
              >
                {doc.title}
              </Typography>
              <Typography variant="body2" className="text-primary-300!">
                Preguntas: {doc.questions}
              </Typography>
              <Typography variant="body2" className="text-primary-300!">
                Respuestas: {doc.responses}
              </Typography>
              <Link
                href={`/documents/${doc.documentId}`}
                className="text-sm text-accent-500 hover:text-accent-300"
              >
                Ver documento
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
