"use client";
import { Skeleton, Typography } from "@mui/material";
import React, { useEffect } from "react";
import FilterStudent from "@/shared/components/table/FilterStudent";
import RequestTable from "@/shared/components/table/UserTables/RequestTable";
import { useStudensCourse } from "../context/StudentsCourseProvider";
import StudentCourseRow from "./StudentCourseRow";
import { useParams } from "next/navigation";

export default function CourseStudentsTable() {
  const {
    isDataLoading,
    students,
    setCourseId,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    setOrderBy,
    orderBy,
    orderDirection,
    setOrderDirection,
    totalPages,
  } = useStudensCourse();

  const params = useParams();
  const { courseId } = params as { courseId: string };

  useEffect(() => {
    setCourseId(courseId);
  }, [courseId]);

  const toolHeader = (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col items-start gap-3 md:flex-row md:justify-between md:items-center mb-6">
        <div className="flex flex-col justify-start items-start gap-2">
          {isDataLoading ? (
            <Skeleton
              animation="wave"
              width={200}
              height={40}
              variant="rounded"
            />
          ) : (
            <Typography variant="h5">Gestionar estudiantes</Typography>
          )}
        </div>
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
          <FilterStudent />
        )}
      </div>
    </div>
  );

  const headers = ["name", "email", ""];

  return (
    <div className="flex flex-col w-full min-h-full items-center px-3 lg:px-6 py-12!">
      <RequestTable
        headers={headers}
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
        isNoData={students.length === 0}
        isReadOnly={true}
      >
        {students.map((student, i) => (
          <StudentCourseRow key={i} {...student} />
        ))}
      </RequestTable>
    </div>
  );
}
