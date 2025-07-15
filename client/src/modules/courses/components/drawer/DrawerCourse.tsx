// import DrawerButton from "@/shared/components/drawer/DrawerButton";
import { useState } from "react";
import {
  IconButton,
  Typography,
  DrawerProps as MuiDrawerProps,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import EditOffIcon from "@mui/icons-material/EditOff";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import theme from "@/shared/styles/theme";
import { CourseFormData } from "../../schema/CourseSchema";
import CourseDrawerContent from "./CourseDrawerContent";
import CourseDrawerForm from "./CourseDrawerForm";
import DrawerTextButton from "./DrawerTextButton";

interface DrawerCourseProps extends MuiDrawerProps {
  data: CourseFormData;
  readOnly?: boolean;
}

export default function DrawerCourse({
  data,
  readOnly,
  ...muiDrawerProps
}: Readonly<DrawerCourseProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isDataLoading] = useState(false);
  const [course, setCourse] = useState<CourseFormData | null>(data);

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

  const handleFinishEdit = () => {
    setIsEditing(false);
    setIsOpen(false);
  }

  // A futuro se llamararia al contexto para que este llame a la API.
  const getCourse = async () => {
    if (!data?.courseId) return;
    //setIsDataLoading(true);
    setCourse(data);
  };

  return (
    <DrawerTextButton
      tooltip="Mostrar detalles del curso"
      isOpen={isOpen}
      {...muiDrawerProps}
      setIsOpen={(e) => {
        if (e) getCourse();
        setIsOpen(e);
      }}
      onClose={handleClose}
      header={
        <>
          <IconButton onClick={handleClose} className="text-secondary!">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className="grow text-center">
            Detalles del curso
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
        course &&
        (isEditing && !readOnly ? (
          <CourseDrawerForm data={course} onToggleEdit={handleFinishEdit} />
        ) : (
          <CourseDrawerContent data={course} isDataLoading={isDataLoading} />
        ))
      )}
    </DrawerTextButton>
  );
}
