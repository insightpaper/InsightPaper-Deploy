"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableCell,
  TableRow,
  TablePagination,
  TableFooter,
  Tooltip,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import LoadingRow from "../../loading/LoadingRow";
import { getTableColumnName } from "@/shared/utils/getTableColumnName";

interface TableProps {
  children: React.ReactNode;
  headers: string[];
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  rowsPerPage: number;
  totalPages: number;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
  orderDirection: "asc" | "desc";
  setOrderDirection: React.Dispatch<React.SetStateAction<"asc" | "desc">>;
  orderBy: string | undefined;
  setOrderBy: React.Dispatch<React.SetStateAction<string | undefined>>;
  isLoading?: boolean;
  toolHeader?: React.ReactNode;
  isNoData?: boolean;
  isReadOnly?: boolean;
}

function RequestTable({
  children,
  headers,
  isLoading,
  toolHeader,
  page,
  setPage,
  totalPages,
  rowsPerPage = 5,
  setRowsPerPage,
  setOrderBy,
  setOrderDirection,
  orderDirection,
  orderBy,
  isNoData,
  isReadOnly,
}: Readonly<TableProps>) {

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleChangeOrder = (orderBy: string) => {
    setOrderBy(orderBy);
    setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
  };

  return (
    <div className="relative rounded-lg!  p-0! border overflow-clip border-primary-700 bg-primary-900! w-full h-full ">
      {toolHeader && <div className="p-4 z-10">{toolHeader}</div>}
      {/* BLUR */}
      <div className="absolute -top-16 left-0  w-[200px]  h-[150px]  rounded-full bg-primary-100 opacity-30 blur-[90px]" />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow className="bg-primary-100 border-t border-primary-700">
              {headers.map((header, index) => {
                const isOrderBy = orderBy === header;
                return (
                  <TableCell
                    align="center"
                    key={index}
                    className=" text-nowrap font-semibold text-primary-900 "
                  >
                    {header !== "" && (
                      <Tooltip title={`Order by ${getTableColumnName(header)}`} placement="top">
                        <button
                          className={`${header ? "" : "cursor-pointer"} group`}
                          onClick={() => header && handleChangeOrder(header)}
                        >
                          {getTableColumnName(header)}

                          <ArrowDropUpIcon
                            className={`${isOrderBy ? "opacity-100!" : "group-hover:opacity-100! opacity-0!"} 
                          ${orderDirection === "asc" ? "rotate-180" : ""} transition-all! duration-200! ease-in-out!`}
                          />
                        </button>
                      </Tooltip>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {!isReadOnly && isNoData && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="italic text-primary-500! "
                  align="center"
                >
                 No hay datos disponibles
                </TableCell>
              </TableRow>
            )}
            {isLoading
              ? Array.from({ length: rowsPerPage }).map((_, index) => (
                  <LoadingRow key={index} cellCount={headers.length} />
                ))
              : children}
          </TableBody>
          {!isReadOnly ? (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  count={rowsPerPage * totalPages}
                  rowsPerPage={rowsPerPage}
                  page={page - 1}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableRow>
            </TableFooter>
          ) : (
            <caption className="p-6"></caption>
          )}
        </Table>
      </TableContainer>
    </div>
  );
}

export default RequestTable;
