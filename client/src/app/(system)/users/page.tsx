"use client"
import {
  TableCell,
  TableRow,
  Skeleton,
  Button,
  Typography,
} from "@mui/material";
import Link from "next/link";
import RequestTable from "@/shared/components/table/UserTables/RequestTable";
import FilterProfessor from "@/shared/components/table/FilterProfessor";
import FilterStudent from "@/shared/components/table/FilterStudent";
import ProfessorRow from "@/modules/user/components/ProfessorRow";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import React from 'react'
import { useUser } from "@/modules/user/context/UserProvider";
import AddProfesorDialog from "@/shared/components/dialogs/AddProfesorDialog";


export default function UserPage() {
  const {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    students,
    professors,
    totalPages,
    isDataLoading,
    orderDirection,
    setOrderDirection,
    orderBy,
    setOrderBy,
    userType,
    setUserType,
  } = useUser();

  const handleStatusChange = (
    event: React.MouseEvent<HTMLElement>,
    newStatus: "student" | "professor" | null
  ) => {
    setOrderBy("");
    if (newStatus) {
      setUserType(newStatus);
      return;
    }
    setUserType(undefined);
  };

  const headers: Record<"professor" | "student", string[]> = {
    professor: ["name", "email", ""],
    student: ["name", "email", ""],
  };

  const toolHeader = (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col items-start gap-3 md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex flex-col justify-start items-start  gap-2">
          {isDataLoading ? (
            <Skeleton
              animation="wave"
              width={200}
              height={40}
              variant="rounded"
            />
          ) : (
            <Typography variant="h5">
              {(() => {
                if (userType === undefined) return "Gestionar usuarios";
                if (userType === "student") return "Gestionar profesores";
                return "Gestionar profesores";
              })()}
            </Typography>
          )}
        </div>
        <ToggleButtonGroup
          value={userType}
          exclusive
          onChange={handleStatusChange}
          className="bg-primary-800 rounded-lg z-10!"
        >
          <ToggleButton
            value="professor"
            className={`!text-secondary !px-4 !py-1 border border-primary-700 ${
              userType === undefined
                ? "bg-primary-700! hover:bg-primary-600!"
                : userType === "professor"
                  ? "bg-accent-500! border-accent-600!"
                  : "hover:bg-primary-700! hover:text-primary-300!"
            }`}
          >
            Profesores
          </ToggleButton>
          <ToggleButton
            value="student"
            className={`!text-secondary !px-4 !py-1 border border-primary-700 ${
              userType === undefined
                ? "bg-primary-700! hover:bg-primary-600!"
                : userType === "student"
                  ? "bg-accent-500! border-accent-600!"
                  : "hover:bg-primary-700! hover:text-primary-300!"
            }`}
          >
            Estudiantes
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      {/* FILTERS EMAIL and StartDate or EndDate  */}
      <div className="flex justify-between w-full gap-4">
        {isDataLoading ? (
          <Skeleton
            animation="wave"
            width={100}
            height={40}
            variant="rounded"
          />
        ) : (
          userType && (
            <>
              {userType === "student" && <FilterStudent />}
              {userType === "professor" && <FilterProfessor />}
            </>
          )
        )}
        {userType === "professor" && (
          <AddProfesorDialog />
        )}
        {userType === "student" && (
          <Link href={"/users/create-user/creator"}>
            <Button variant="outlined">Crear estudiante</Button>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <main className='flex flex-col w-full min-h-full items-center px-3 lg:px-6 py-12!'>
      <RequestTable
        headers={userType ? headers[userType] : []}
        isLoading={isDataLoading}
        toolHeader={toolHeader}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        totalPages={totalPages}
        orderDirection={orderDirection}
        setOrderDirection={setOrderDirection}
        orderBy={orderBy}
        setOrderBy={setOrderBy}
        isNoData={
          userType === "professor" ? professors.length === 0 : students.length === 0
        }
        isReadOnly={!userType}
      >
        {userType === "professor" &&
          professors.map((professor, i) => <ProfessorRow key={i} {...professor} />)}
        {/* {userType === "student" &&
          students.map((student, i) => <CreatorRow key={i} {...student} />)} */}

        {!userType && (
          <TableRow className="group   bg-primary-800 transition-all duration-200 ease-in-out">
            <TableCell
              colSpan={99}
              className="italic text-primary-400! "
              align="center"
            >
              Seleccione <b>Profesores</b> o <b>Estudiantes</b> para continuar
            </TableCell>
          </TableRow>
        )}
      </RequestTable>
    </main>
  )
}
