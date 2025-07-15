"use client";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { apiRequest } from "@/shared/utils/request/apiRequest";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { createContext, useContext } from "react";
import { StudentCourseFormData } from "../schema/StudentCourseSchema";
import useQueryParams from "@/shared/hooks/useQueryParams";

interface StudentCourseContextType {
  students: StudentCourseFormData[];
  setStudents: Dispatch<SetStateAction<StudentCourseFormData[]>>;
  isDataLoading: boolean;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  orderDirection: "asc" | "desc";
  setOrderDirection: Dispatch<SetStateAction<"asc" | "desc">>;
  orderBy: string | undefined;
  setOrderBy: Dispatch<SetStateAction<string | undefined>>;
  totalPages: number;
  courseId: string;
  setCourseId: Dispatch<SetStateAction<string>>;
  removeStudent: (courseId: string, userId?: string) => Promise<void>;
}

export const StudentCourseContext =
  createContext<StudentCourseContextType | null>(null);

export const useStudensCourse = () => {
  const context = useContext(StudentCourseContext);
  if (!context) {
    throw new Error("useStudensCourse must be used within a CourseProvider");
  }
  return context;
};

function StudentCourseProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [courseId, setCourseId] = useState<string>("");
  const [students, setStudents] = useState<StudentCourseFormData[]>([]);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string | undefined>("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const {
    queryParams: { email: emailFilter, startDate, endDate },
  } = useQueryParams(["email", "startDate", "endDate"]);

  const getStudentsFromCourse = async (courseId: string) => {
    setIsDataLoading(true);
    try {
      const params = {
        ...(emailFilter !== "" && { email: emailFilter }),
        ...(orderDirection !== undefined && { orderDirection }),
        ...(orderBy !== undefined && { orderBy }),
      }
      const res = await apiRequest<{
        result: StudentCourseFormData[];
      }>({
        method: "get",
        url: `/api/courses/courseStudents/${courseId}`,
        params
      });
      setStudents(res.result);
      setTotalPages(res.result.length);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };

  const removeStudent = async (courseId: string, userId?: string) => {
    if (!userId) {
      notifyError("UserId not found");
      throw new Error("userId is required");
    }
    setIsDataLoading(true);
    try {
      await apiRequest({
        method: "put",
        url: `/api/courses/removeStudent/${courseId}`,
        data: {
          studentId: userId,
        }
      });
      notifySuccess("Estudiante eliminado correctamente");
      getStudentsFromCourse(courseId);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };



  useEffect(() => {
    if (courseId !== "") {
      getStudentsFromCourse(courseId);
    }
  }, [
    courseId,
    page,
    rowsPerPage,
    orderDirection,
    orderBy,
    startDate,
    endDate,
    emailFilter,
  ]);

  return (
    <StudentCourseContext.Provider
      value={{
        students,
        setStudents,
        isDataLoading,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        orderDirection,
        setOrderDirection,
        orderBy,
        setOrderBy,
        totalPages,
        courseId,
        setCourseId,
        removeStudent,
      }}
    >
      {children}
    </StudentCourseContext.Provider>
  );
}

export default StudentCourseProvider;
