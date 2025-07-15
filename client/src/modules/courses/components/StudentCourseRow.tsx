import { useState } from "react";
import { TableRow, TableCell, IconButton, Tooltip } from "@mui/material";
import DrawerStudentCourse from "./drawer/DrawerStudentCourse";
import { useStudensCourse } from "../context/StudentsCourseProvider";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import { ChatOutlined } from "@mui/icons-material";
import { RemoveCircleOutline } from "@mui/icons-material";
import { useRouter } from "next/navigation";

//INTERFACE
import { StudentCourseFormData } from "../schema/StudentCourseSchema";
import { useParams } from "next/navigation";

export default function StudentCourseRow(row: StudentCourseFormData) {
  const { name, email, userId } = row;
  const { removeStudent } = useStudensCourse();
  const [isStudentRemoving, setIsStudentRemoving] = useState(false);
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const handleRemoveProfessorUser = async () => {
    if (isStudentRemoving) return;
    try {
      setIsStudentRemoving(true);
      await removeStudent(courseId, row.userId);
    } catch {
    } finally {
      setIsStudentRemoving(false);
    }
  };

  return (
    <TableRow
      className={`${isStudentRemoving && "animate-pulse-fast"}  group hover:bg-primary-800 transition-all duration-200 ease-in-out`}
    >
      {/* Name */}
      <TableCell align="center" className="text-primary-700">
        {name || "_"}
      </TableCell>

      {/* Email */}
      <TableCell align="center" className="text-primary-700">
        {email || "_"}
      </TableCell>

      <TableCell
        align="right"
        className="flex item-center flex-wrap justify-center text-primary-700"
      >
        <Tooltip title="Ver chats">
          <IconButton
            onClick={() => {
              router.push(`/courses/${courseId}/students/${userId}/chats`);
            }}
          >
            <ChatOutlined />
          </IconButton>
        </Tooltip>

        <DrawerStudentCourse data={row} />

        <ConfirmationDialog
          cancelText="No"
          confirmText="Si"
          title="Eliminar estudiante"
          content="¿Estás seguro de que quieres eliminar a este usuario?"
          onCancel={() => {}}
          onConfirm={handleRemoveProfessorUser}
          isPositiveAction={false}
        >
          <IconButton color="error">
            <RemoveCircleOutline />
          </IconButton>
        </ConfirmationDialog>
      </TableCell>
    </TableRow>
  );
}
