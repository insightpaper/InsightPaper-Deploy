import { useState } from "react";
import { TableRow, TableCell, IconButton } from "@mui/material";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";

import { RemoveCircleOutline } from "@mui/icons-material";
import DrawerDocument from "../drawer/DrawerDocument";
import { useDocuments } from "../../context/DocumentsProvider";

//INTERFACE

interface DocumentRowProps {
  id: string;
  title: string;
  description: string;
  size: string;
  url: string;
}

export default function DocumentRow(row: DocumentRowProps) {
  const { title, description, size } = row;
  const [isDocumentRemoving, setIsDocumentRemoving] = useState(false);
  const { deleteDocument } =useDocuments();
  const handleRemoveDocument = async () => {
    if (isDocumentRemoving) return;
    try {
      setIsDocumentRemoving(true);
      await deleteDocument(row.id);
    } catch {
    } finally {
      setIsDocumentRemoving(false);
    }
  };

  return (
    <TableRow
      className={`${isDocumentRemoving && "animate-pulse-fast"}  group hover:bg-primary-800 transition-all duration-200 ease-in-out`}
    >
      <TableCell align="center" className="text-primary-700">
        {title || "_"}
      </TableCell>

      <TableCell align="center" className="text-primary-700">
        {description || "_"}
      </TableCell>

      <TableCell align="center" className="text-primary-700">
        {size || "_"}
      </TableCell>

      <TableCell
        align="right"
        className="flex item-center flex-wrap justify-center text-primary-700"
      >
        
        <DrawerDocument
          documentId={row.id}   // Se recibe el documento en formato document item
          readOnly={false}
        />
        
        <ConfirmationDialog
          cancelText="No"
          confirmText="Sí"
          content="¿Estás seguro de que quieres eliminar este documento?"
          title="Eliminar documento"
          onCancel={() => { }}
          onConfirm={handleRemoveDocument}
        >
          <IconButton color="error">
            <RemoveCircleOutline />
          </IconButton>
        </ConfirmationDialog>
      </TableCell>
    </TableRow>
  );
}
