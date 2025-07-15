"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableCell,
  TableRow,
} from "@mui/material";
import LoadingRow from "../loading/LoadingRow";

interface TableProps {
  children: React.ReactNode;
  headers: string[];
  isLoading?: boolean;
  toolHeader?: React.ReactNode;
  isNoData?: boolean;
  numLoadingRows?: number;
}

export default function GeneralTable({
  children,
  headers,
  isLoading,
  toolHeader,
  isNoData,
  numLoadingRows = 5,
}: Readonly<TableProps>) {
  return (
    <div className="relative rounded-lg!  p-0! border overflow-clip border-primary-700 bg-primary-900! w-full h-full ">
      {toolHeader && <div className="p-4 z-10">{toolHeader}</div>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow className="bg-primary-100 border-t border-primary-700 z-20! ">
              {headers.map((header, index) => (
                <TableCell
                  align="center"
                  key={index}
                  className=" text-nowrap  font-semibold text-primary-900 cursor-pointer"
                >
                  <span className="z-20!">{header}</span>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className="z-20!">
            {isNoData && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="italic text-primary-500! "
                  align="center"
                >
                  Sin datos disponibles
                </TableCell>
              </TableRow>
            )}
            {isLoading
              ? Array.from({ length: numLoadingRows }).map((_, index) => (
                  <LoadingRow key={index} cellCount={headers.length} />
                ))
              : children}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
