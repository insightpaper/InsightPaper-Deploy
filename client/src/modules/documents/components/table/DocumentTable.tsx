import LoadingRow from "@/shared/components/loading/LoadingRow";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import React from "react";
import DocumentRow from "./DocumentRow";
import { DocumentItem } from "@/shared/interfaces/Documents";

export default function DocumentTable({
  data,
  isLoading,
  page,
  setPage,
  setRowsPerPage,
  rowsPerPage,
  totalPages,
}: {
  data: DocumentItem[];
  isLoading: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
  totalPages: number;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const headers = ["Título", "Descripción", "Tamaño", ""];
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow className="bg-primary-100 border-t border-primary-700">
            {headers.map((header, index) => {
              return (
                <TableCell
                  align="center"
                  key={index}
                  className=" text-nowrap font-semibold text-primary-900 "
                >
                  {header || ""}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <LoadingRow key={index} cellCount={headers.length} />
              ))
            : data.map((row) => (
                <DocumentRow
                  key={row.documentId}
                  id={row.documentId}
                  title={row.title}
                  description={row.description}
                  size={row.size}
                  url={row.firebaseUrl}
                />
              ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[5, 10, 15, 20, 25]}
              count={rowsPerPage * totalPages}
              rowsPerPage={rowsPerPage}
              page={page - 1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
