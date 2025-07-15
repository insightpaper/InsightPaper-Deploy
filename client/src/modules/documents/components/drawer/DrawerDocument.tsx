"use client";
import { useState, useEffect } from "react";
import {
  IconButton,
  Typography,
  DrawerProps as MuiDrawerProps,
  useTheme,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import DrawerTextButton from "@/modules/courses/components/drawer/DrawerTextButton";

import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import DocumentDrawerContent from "./DocumentDrawerContent";
import { DocumentItem } from "@/shared/interfaces/Documents";
import DocumentDrawerForm from "./DocumentDrawerForm";
import { useDocuments } from "../../context/DocumentsProvider";
import DrawerButton from "@/shared/components/drawer/DrawerButton";

interface DrawerDocumentProps extends MuiDrawerProps {
  documentId: string;
  readOnly?: boolean;
  isTextButton?: boolean;
}

interface DrawerButtonHeaderProps {
  readOnly?: boolean;
  isDataLoading?: boolean;
  isEditing?: boolean;
  handleClose: () => void;
  handleToggleEdit: () => void;
}

function DrawerButtonHeader({
  readOnly,
  isDataLoading,
  isEditing,
  handleClose,
  handleToggleEdit,
}: DrawerButtonHeaderProps) {
  return (
    <>
      <IconButton onClick={handleClose} className="text-secondary!">
        <CloseIcon />
      </IconButton>
      <Typography variant="h6" className="grow text-center">
        Detalles del documento
      </Typography>
      {!readOnly && !isDataLoading && (
        <IconButton
          className=" hover:text-accent-500 transition-all duration-200 ease-in-out"
          onClick={handleToggleEdit}
        >
          {isEditing ? <EditOffIcon /> : <EditIcon />}
        </IconButton>
      )}
    </>
  );
}

export default function DrawerDocument({
  documentId,
  readOnly,
  isTextButton = false,
  ...muiDrawerProps
}: DrawerDocumentProps) {
  const theme = useTheme();
  const { documents } = useDocuments();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isDataLoading] = useState(false);
  const [document, setDocument] = useState<DocumentItem | null>(null);

  // Se usa para actualizar el documento cuando se edita, ya que no se reflejan los cambios
  useEffect(() => {
    if (documents && documentId) {
      const updatedDoc = documents.find((doc) => doc.documentId === documentId);
      if (updatedDoc) {
        setDocument(updatedDoc);
      }
    }
  }, [documents, documentId]);

  const handleClose = () => {
    if (isEditing) {
      setIsOpen(true);
      setIsWarning(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setIsWarning(true);
    } else {
      setIsEditing(!isEditing);
    }
  };

  const getChangeHistory = async () => {
    // Llamamos al contexto
  };

  const drawerContent = (
    <>
      <ConfirmationDialog
        sx={{
          zIndex: theme.zIndex.modal + 2,
        }}
        title="Advertencia"
        content="¿Seguro que desea cancelar la edición? Se perderán todos los cambios no guardados."
        confirmText="Confirmar"
        cancelText="Cancelar"
        isOpen={isWarning}
        onCancel={() => setIsWarning(false)}
        onConfirm={() => {
          setIsWarning(false);
          setIsEditing(false);
        }}
        isPositiveAction={false}
      />
      {isDataLoading ? (
        <div className="flex justify-center items-center h-full">
          <CircularProgress color="primary" />
        </div>
      ) : (
        document &&
        (isEditing && !readOnly ? (
          <DocumentDrawerForm
            data={document}
            onToggleEdit={handleToggleEdit}
            onClose={() => setIsEditing(false)}
          />
        ) : (
          <DocumentDrawerContent
            data={document}
            isDataLoading={isDataLoading}
          />
        ))
      )}
    </>
  );

  const props = {
    isOpen,
    setIsOpen: (e: boolean) => {
      if (e) getChangeHistory();
      setIsOpen(e);
    },
    header: (
      <DrawerButtonHeader
        readOnly={readOnly}
        isDataLoading={isDataLoading}
        isEditing={isEditing}
        handleClose={handleClose}
        handleToggleEdit={handleToggleEdit}
      />
    ),
    ...muiDrawerProps,
  };
  return isTextButton ? (
    <DrawerTextButton
      tooltip="Mostrar detalles del documento"
      {...props}
      onClose={handleClose}
    >
      {drawerContent}
    </DrawerTextButton>
  ) : (
    <DrawerButton
      tooltip="Mostrar detalles del documento"
      {...props}
      onClose={handleClose}
    >
      {drawerContent}
    </DrawerButton>
  );
}
