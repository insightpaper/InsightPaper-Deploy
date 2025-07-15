"use client";
import { useState } from "react";
import {
  IconButton,
  Typography,
  useTheme,
  DrawerProps as MuiDrawerProps,
  CircularProgress,
} from "@mui/material";

import DrawerButton from "@/shared/components/drawer/DrawerButton";
import ProfessorDrawerContent from "./ProfessorDrawerContent";
import DrawerProfessorForm from "./DrawerProfessorForm";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";

//ICONS
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import CloseIcon from "@mui/icons-material/Close";

//INTERFACE
import { UserFormData } from "../../schema/UserSchema";
import { IntProfessorDetails, ProfessorStats } from "../../interfaces/ProfessorDetails";
import { apiRequest } from "@/shared/utils/request/apiRequest";
interface DrawerCreatorProps extends MuiDrawerProps {
  data: UserFormData;
  readOnly?: boolean;
}

export default function DrawerProfessor({
  data,
  readOnly,
  ...muiDrawerProps
}: Readonly<DrawerCreatorProps>) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [professor, setProfessor] = useState<IntProfessorDetails | null>(null);
  const [metrics, setMetrics] = useState<ProfessorStats | null>(null);

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

  const getProfessor = async () => {
    if (!data?.userId) return;
    setIsDataLoading(true);
    try {

      const res = await apiRequest<IntProfessorDetails>({
        method: "get",
        url: `/api/users/professorDetails/${data?.userId}`,
      });

      const response = await apiRequest<ProfessorStats>({
        method: "get",
        url: `/api/users/profesorsActivity/${data?.userId}`,
      });

      setMetrics(response);

      setProfessor(res);
    } catch {
    } finally {
      setIsDataLoading(false);
    }
  };

  return (
    <DrawerButton
      tooltip="Mostrar detalles del profesor"
      {...muiDrawerProps}
      isOpen={isOpen}
      setIsOpen={(e) => {
        if (e) getProfessor();
        setIsOpen(e);
      }}
      onClose={handleClose}
      header={
        <>
          <IconButton onClick={handleClose} className="text-secondary!">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className="grow text-center">
            Detalles del profesor
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
      }
    >
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
        professor &&
        (isEditing && !readOnly ? (
          <DrawerProfessorForm data={data} onToggleEdit={handleToggleEdit} />
        ) : (
          <ProfessorDrawerContent
            data={professor}
            stats={metrics}
            isDataLoading={isDataLoading}
          />
        ))
      )}
    </DrawerButton>
  );
}
