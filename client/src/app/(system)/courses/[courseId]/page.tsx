"use client";
import "@/shared/styles/tiptap.css";
import { useCourse } from "@/modules/courses/context/CourseProvider";
import { useState } from "react";
import Dialog from "@/shared/components/dialogs/Dialog";
import { IconButton, Skeleton, Typography } from "@mui/material";
import { Settings as SettingsIcon } from "@mui/icons-material";
import CopyText from "@/shared/components/CopyText";
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import { useRouter } from "next/navigation";
import DOMPurify from "dompurify";
import { Menu, MenuItem } from "@mui/material";

export default function CoursePage() {
  const { course, leaveCourse, isDataLoading } = useCourse();
  const [isOpenCode, setIsOpenCode] = useState(false);
  const { currentUserData } = useSystemLayout();
  const role = currentUserData?.roles?.[0].name;
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const router = useRouter();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const isSettingsOpen = Boolean(settingsAnchorEl);
  const handleOpenSettings = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  const handleCloseSettings = () => {
    setSettingsAnchorEl(null);
  };

  const handleJoinModal = () => {
    setIsOpenCode(!isOpenCode);
  };

  const handleLeaveCourse = () => {
    try {
      leaveCourse();
      router.push("/courses");
    } catch {}
  };

  return (
    <main className="flex flex-col w-full min-h-full px-3 lg:px-6 py-12!">
      <ConfirmationDialog
        cancelText="Cancelar"
        confirmText="Confirmar"
        content="¿Está seguro que desea salir de este curso?"
        title="Salir del curso"
        isPositiveAction={false}
        isOpen={openDelete}
        onCancel={() => setOpenDelete(false)}
        onConfirm={() => handleLeaveCourse()}
      />
      <div className="flex justify-between w-full gap-4">
        <Typography variant="h4">
          {isDataLoading ? <Skeleton /> : course?.name}
        </Typography>
        <div className="flex gap-4 justify-between">
          <IconButton onClick={handleOpenSettings}>
            <SettingsIcon />
          </IconButton>
          <Menu
            anchorEl={settingsAnchorEl}
            open={isSettingsOpen}
            onClose={handleCloseSettings}
            PaperProps={{
              style: {
                backgroundColor: "#171717", // tu gris oscuro
                color: "#e5e7eb",
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleCloseSettings();
                router.push(`/courses/${course?.courseId}/documents`);
              }}
            >
              Ver documentos
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseSettings();
                handleJoinModal();
              }}
            >
              Código del curso
            </MenuItem>
            {role === "Student" ? (
              <MenuItem
                onClick={() => {
                  handleCloseSettings();
                  setOpenDelete(true);
                }}
                sx={{ color: "#ef4444" }} // rojo suave
              >
                Salir del curso
              </MenuItem>
            ) : (
              <MenuItem
                onClick={() => {
                  handleCloseSettings();
                  router.push(`/courses/${course?.courseId}/students`);
                }}
              >
                Ver estudiantes
              </MenuItem>
            )}
          </Menu>
        </div>
      </div>
      <div className="flex flex-wrap flex-column items-start w-full min-h-full gap-4 py-4">
        {isDataLoading ? (
          <div className="w-full mt-5">
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
            <Skeleton animation="wave" />
          </div>
        ) : (
          course?.description && (
            <div
              className="tiptap ProseMirror text-primary-200"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(course.description),
              }}
            />
          )
        )}
        <div>{/* Aqui van las estadisticas */}</div>
      </div>
      <Dialog
        header="Código del curso"
        open={isOpenCode}
        setOpen={setIsOpenCode}
        className="max-w-sm mx-auto"
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-4 w-full">
            <Typography variant="h6">Código del curso</Typography>
            <div className="flex items-center gap-2 bg-primary-800 p-2 rounded-lg">
              {course?.code ? (
                <>
                  <Typography variant="body1" className="!font-mono !text-2xl">
                    {course?.code}
                  </Typography>
                  <CopyText text={`${course?.code}`} />
                </>
              ) : (
                <>
                  <Typography variant="body1" className="!font-mono uppercase">
                    No disponible
                  </Typography>
                </>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
