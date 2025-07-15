import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Typography,
  Divider,
  Chip,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Table,
  Button,
} from "@mui/material";
import { DocumentItem } from "@/shared/interfaces/Documents";
import { useDocuments } from "../../context/DocumentsProvider";
import { formatSimpleDate } from "@/shared/utils/date/dateFormatter";
import { Send } from "@mui/icons-material";

interface DocumentDrawerContentProps {
  data: DocumentItem; // Replace with the actual type of your data
  isDataLoading?: boolean;
}

export default function DocumentDrawerContent({
  data,
  isDataLoading,
}: DocumentDrawerContentProps) {
  const { documentHistory, getDocumentHistory, sendRecommendation } = useDocuments();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getDocumentHistory(data.documentId);
  }, [data.documentId]);

  if (isDataLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-4 p-6">
        <CircularProgress size={45} />
      </div>
    );
  }

  const handleSendRecommendation = () => {
    sendRecommendation(data.documentId);
  }

  const handleDescriptionClick = (historyId: string) => {
    setExpandedId((prev) => (prev === historyId ? null : historyId));
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Document Info */}
      <div className="bg-primary-800 p-4 rounded-lg shadow-md">
        <Typography variant="h6" className="text-primary-400 font-medium mb-2">
          Información del documento:
        </Typography>
        <Divider className="border-primary-600 mb-3!" />
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-2">
            <Typography variant="subtitle2" className="text-primary-300">
              Título:
            </Typography>
            <Typography variant="body2">
              {data.title || "No title provided."}
            </Typography>
          </div>
          <div className="flex items-start gap-2">
            <Typography variant="body2" className="text-primary-300">
              Descripción:
            </Typography>
            <Typography variant="body2">
              {data.description || "No description provided."}
            </Typography>
          </div>
          <div className="flex items-start gap-2">
            <Typography variant="body2" className="text-primary-300">
              Etiquetas:
            </Typography>
            {data.labels
              ? data.labels.map((label, index) => (
                  <Chip
                    key={index}
                    label={label}
                    className="!bg-primary-700 !text-primary-200"
                    size="small"
                  />
                ))
              : "Sin labels."}
          </div>
          <Button onClick={handleSendRecommendation} variant="contained" color="primary" endIcon={<Send />}>
            Enviar recomendación a estudiantes
          </Button>
        </div>
      </div>

      {/* Historial de cambios del documento */}
      <div className="flex flex-col">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Etiquetas</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentHistory.map((history) => (
                <TableRow key={history.historyId}>
                  <TableCell>{history.title}</TableCell>
                  <TableCell
                    onClick={() =>
                      handleDescriptionClick(history.historyId.toString())
                    }
                    className="cursor-pointer w-[300px] max-w-[300px]"
                  >
                    {expandedId == history.historyId.toString()
                      ? history.description
                      : (history.description?.slice(0, 30) || "") +
                        (history.description.length > 30 ? "..." : "")}
                  </TableCell>

                  <TableCell>
                    {history.labels.length > 0
                      ? history.labels.map((label, index) => (
                          <Chip
                            key={index}
                            label={label}
                            className="!bg-primary-700 !text-primary-200 m-1"
                            size="small"
                          />
                        ))
                      : "Sin etiquetas."}
                  </TableCell>

                  <TableCell>{formatSimpleDate(history.createdDate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
