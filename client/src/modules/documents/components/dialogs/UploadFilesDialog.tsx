"use client";
import Dialog from "@/shared/components/dialogs/Dialog";
import { AddCircle, CloudUpload, Delete, Edit, UploadFile } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Chip,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import React, { useState } from "react";
import { useDocuments } from "../../context/DocumentsProvider";
import { notifyError } from "@/shared/utils/toastNotify";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

type FileWithMeta = {
  file: File;
  progress: number;
  uploaded: boolean;
  title: string;
  description: string;
  isEditing: boolean;
  labels: string[];
};

export default function UploadFilesDialog() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ labelInput, setLabelInput ] = useState("");
  const { uploadDocument } = useDocuments();

  const toggleDialog = () => setOpen(!open);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );
    const filesWithMeta: FileWithMeta[] = selectedFiles.map((file) => ({
      file,
      progress: 0,
      uploaded: false,
      title: file.name.replace(/\.pdf$/i, ""),
      description: "Descripción del archivo",
      labels: [],
      isEditing: false,
    }));
    setFiles((prev) => [...prev, ...filesWithMeta]);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditToggle = (index: number) => {
    setFiles((prev) =>
      prev.map((file, i) =>
        i === index ? { ...file, isEditing: !file.isEditing } : file
      )
    );
  };

  const handleInputChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // const simulateUpload = (
  //   fileObj: FileWithMeta,
  //   index: number
  // ): Promise<void> => {
  //   return new Promise((resolve) => {
  //     const interval = setInterval(() => {
  //       setFiles((prev) => {
  //         const updated = [...prev];
  //         const current = updated[index];
  //         if (current.progress >= 100) {
  //           clearInterval(interval);
  //           current.uploaded = true;
  //           resolve();
  //         } else {
  //           current.progress += 10;
  //         }
  //         return [...updated];
  //       });
  //     }, 100);
  //   });
  // };

  const handleAddLabel = (fileIndex: number) => {
    const newLabel = labelInput.trim();
    if (newLabel && !files[fileIndex].labels.includes(newLabel)) {
      setFiles((prev) => {
        const updated = [...prev];
        if (!updated[fileIndex].labels.find(label => label === newLabel)) {
          updated[fileIndex].labels.push(newLabel);
        }
        return updated;
      });
      setLabelInput("");
    }
  };

  const handleDeleteLabel = (fileIndex: number, labelToDelete: string) => {
    setFiles((prev) => {
      const updated = [...prev];
      updated[fileIndex].labels = updated[fileIndex].labels.filter(
        (label) => label !== labelToDelete
      );
      return updated;
    });
  }

  const handleUpload = async () => {
    setIsLoading(true);
    for (let i = 0; i < files.length; i++) {
      if (!files[i].uploaded) {
        try {
          // Definir callback para actualizar el progreso
          const updateProgress = (progress: number) => {
            setFiles((prev) => {
              const updated = [...prev];
              updated[i].progress = progress;
              return updated;
            });
          };
          
          // Llamar a uploadDocument con el callback de progreso
          await uploadDocument(files[i], updateProgress);
          
          // Marcar como subido cuando se complete
          setFiles((prev) =>
            prev.map((file, index) =>
              index === i ? { ...file, uploaded: true } : file
            )
          );
        } catch (error) {
          notifyError(getErrorMessage(error as string));
        }
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      <Tooltip title="Subir documento">
        <IconButton
          onClick={toggleDialog}
          color="primary"
          className="!bg-primary-800 !p-2 !rounded-xl text-white hover:!bg-primary-900 transition-colors"
        >
          <UploadFile />
        </IconButton>
      </Tooltip>
      <Dialog header="Subir documentos" open={open} setOpen={toggleDialog}>
        <div className="w-full p-4">
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="fileInput"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="fileInput" className="block text-sm text-gray-200">
              <div className="text-gray-400 text-2xl mb-2">
                <CloudUpload fontSize="inherit" />
              </div>
              Elige un archivo o arrástralo aquí.
              <p className="text-xs text-gray-400 mt-1">
                Solo PDF, hasta 50 MB
              </p>
            </label>
          </div>

          <div className="my-4 space-y-2 max-h-52 overflow-y-auto">
            {files.map((fileObj, index) => (
              <div
                key={index}
                className="flex flex-col bg-primary-800 p-2 rounded-md"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    {fileObj.isEditing ? (
                      <>
                        <TextField
                          size="small"
                          label="Título"
                          variant="outlined"
                          value={fileObj.title}
                          onChange={(e) =>
                            handleInputChange(index, "title", e.target.value)
                          }
                          fullWidth
                          className="!mb-4 !mt-3"
                        />
                        <TextField
                          size="small"
                          label="Descripción"
                          variant="outlined"
                          required
                          className="!mb-2"
                          value={fileObj.description}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          fullWidth
                        />
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <TextField
                            variant="outlined"
                            size="small"
                            label="Añadir etiqueta"
                            className="!mb-2"
                            value={labelInput}
                            onChange={(e) => setLabelInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddLabel(index);
                              }
                            }}
                            fullWidth
                            />
                            <IconButton onClick={() => handleAddLabel(index)} color="primary">
                              <AddCircle />
                            </IconButton>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {fileObj.labels.map((label, idx) => (
                              <Chip
                                key={idx}
                                label={label}
                                onDelete={() => handleDeleteLabel(index, label)}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-medium text-primary-200 text-ellipsis overflow-hidden">
                          {fileObj.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {fileObj.description || "Sin descripción"}
                        </p>
                      </>
                    )}
                    <div className="w-full h-1 bg-gray-300 rounded overflow-hidden mt-2">
                      <div
                        className={`h-1 ${fileObj.uploaded ? "bg-green-500" : "bg-blue-500"}`}
                        style={{
                          width: `${fileObj.uploaded ? 100 : fileObj.progress}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-200 mt-1">
                      {fileObj.uploaded
                        ? "Completado"
                        : `Subiendo... ${fileObj.progress}%`}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <IconButton onClick={() => handleEditToggle(index)}>
                      <Edit fontSize="small" className="text-primary-300" />
                    </IconButton>
                    <IconButton onClick={() => handleRemove(index)}>
                      <Delete fontSize="small" className="text-error" />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {files.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              className="w-full mt-4"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <CloudUpload />
                )
              }
            >
              {isLoading ? "Subiendo..." : "Subir a storage"}
            </Button>
          )}
        </div>
      </Dialog>
    </>
  );
}
