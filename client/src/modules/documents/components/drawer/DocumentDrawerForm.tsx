"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Button,
  TextField,
  Typography,
  Divider,
  CircularProgress,
  IconButton,
  Chip,
} from "@mui/material";

import { useDocuments } from "../../context/DocumentsProvider";
import { DocumentItem } from "@/shared/interfaces/Documents";
import {
  EditDocumentSchema,
  DocumentFormData,
} from "../../schema/DocumentSchema";
import { useState } from "react";
import { AddCircle} from "@mui/icons-material";

interface DocumentDrawerFormProps {
  data: DocumentItem;
  onToggleEdit: () => void;
  onClose: () => void;
}

export default function DocumentDrawerForm({
  data,
  onToggleEdit,
  onClose
}: Readonly<DocumentDrawerFormProps>) {
  const { editDocument } = useDocuments();
  const [labelInput, setLabelInput] = useState("");
  const [labels, setLabels] = useState<string[]>(data.labels || []);

  const handleAddLabel = () => {
    const newLabel = labelInput.trim();
    if (newLabel && !labels.includes(newLabel)) {
      setLabels((prev) => [...prev, newLabel]);
      setLabelInput("");
    }
  };

  const handleDeleteLabel = (labelToDelete: string) => {
    setLabels((prev) => prev.filter((label) => label !== labelToDelete));
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(EditDocumentSchema),
    defaultValues: {
      documentId: data.documentId,
      title: data.title,
      description: data.description,
      labels: data.labels || [],
    },
  });

  const handleClose = () => {
    onToggleEdit();
  };

  const onSubmit = async (formData: DocumentFormData) => {
    try {
      await editDocument({
        ...formData,
        labels: labels,
        size: data.size, // Include the size from the existing data
        firebaseUrl: data.firebaseUrl, // Include the url from the existing data
      });
      reset(); // Reset form when closing
      onClose();
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 h-full">
      <div className="flex items-center justify-between">
        <Typography variant="h6" className="text-primary-400 font-medium">
          Editar información del documento
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
        <div className="bg-primary-800 p-4 rounded-lg shadow-md">
          <Typography
            variant="h6"
            className="text-primary-400 font-medium mb-2"
          >
            Información del documento:
          </Typography>
          <Divider className="border-primary-600 mb-3!" />
          <div className="flex flex-col gap-3">
            <TextField
              variant="filled"
              fullWidth
              label="Titulo"
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <TextField
              variant="filled"
              fullWidth
              label="Descripción"
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
              rows={4}
              multiline
            />
          </div>
          <div className="flex flex-col gap-2">
            <Typography variant="subtitle1">Etiquetas:</Typography>
            <div className="flex gap-2">
              <TextField
                variant="filled"
                label="Añadir etiqueta"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLabel();
                  }
                }}
                fullWidth
              />
              <IconButton onClick={handleAddLabel} color="primary">
                <AddCircle />
              </IconButton>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {labels.map((label, idx) => (
                <Chip
                  key={idx}
                  label={label}
                  onDelete={() => handleDeleteLabel(label)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
