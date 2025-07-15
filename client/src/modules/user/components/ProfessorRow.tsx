import { useState } from "react";
import { TableRow, TableCell, IconButton } from "@mui/material";
import DrawerProfessor from "./drawer/DrawerProfessor";
import { useUser } from "../context/UserProvider";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";

import { RemoveCircleOutline } from "@mui/icons-material";

//INTERFACE
import { UserFormData } from "../schema/UserSchema";

export default function ProfessorRow(row: UserFormData) {
  const { name, email } = row;
  const { deleteProfessor } = useUser();
  const [isCreatorRemoving, setIsCreatorRemoving] = useState(false);

  const handleRemoveProfessorUser = async () => {
    if (isCreatorRemoving) return;
    try {
      setIsCreatorRemoving(true);
      await deleteProfessor(row.userId);
    } catch {
    } finally {
      setIsCreatorRemoving(false);
    }
  };

  return (
    <TableRow
      className={`${isCreatorRemoving && "animate-pulse-fast"}  group hover:bg-primary-800 transition-all duration-200 ease-in-out`}
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
        <DrawerProfessor data={row} />

        <ConfirmationDialog
          cancelText="No"
          confirmText="Sí"
          title="Eliminar profesor"
          content="¿Estás seguro de que quieres eliminar a esta usuario?"
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
