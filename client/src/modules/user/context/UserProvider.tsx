"use client";
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import useQueryParams from "@/shared/hooks/useQueryParams";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
// import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";

//UTILS
import { apiRequest } from "@/shared/utils/request/apiRequest";

//INTERFACE
import { UserFormData } from "../schema/UserSchema";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { IntProfessorDetails } from "../interfaces/ProfessorDetails";

interface UserContextType {
  professors: UserFormData[];
  setProfessors: Dispatch<SetStateAction<UserFormData[]>>;
  students: UserFormData[];
  setStudents: Dispatch<SetStateAction<UserFormData[]>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  rowsPerPage: number;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  orderDirection: "asc" | "desc";
  setOrderDirection: Dispatch<SetStateAction<"asc" | "desc">>;
  orderBy: string | undefined;
  setOrderBy: Dispatch<SetStateAction<string | undefined>>;
  userType: "student" | "professor" | undefined;
  setUserType: Dispatch<SetStateAction<"student" | "professor" | undefined>>;
  isDataLoading: boolean;
  totalPages: number;
  getProfessorDetails: (
    userId: string
  ) => Promise<IntProfessorDetails | undefined>;
  createProfessor: (data: UserFormData) => Promise<void>;
  editProfessor: (data: UserFormData, isSame?: boolean) => Promise<void>;
  deleteProfessor: (userId?: string) => Promise<void>;
  createStudent: (data: UserFormData) => Promise<void>;
  editStudent: (data: UserFormData) => Promise<void>;
  deleteStudent: (userId?: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

function UserProvider({
  children,
  userTypeProp = undefined,
}: Readonly<{
  children: React.ReactNode;
  userTypeProp?: "student" | "professor" | undefined;
}>) {
  //   const { isUserIs, getBrandFromUser } = useSystemLayout();
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [students, setStudents] = useState<UserFormData[]>([]);
  const [professors, setProfessors] = useState<UserFormData[]>([]);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string | undefined>("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [userType, setUserType] = useState<"student" | "professor" | undefined>(
    userTypeProp
  );

  //Queries
  const {
    queryParams: {
      email: emailFilter,
      companyName: companyFilter,
      startDate,
      endDate,
    },
  } = useQueryParams(["email", "companyName", "startDate", "endDate"]);

  const getProfessors = async () => {
    setIsDataLoading(true);
    try {
      const params = {
        pageNumber: page,
        pageSize: rowsPerPage,
        ...(startDate !== "" && { startDate }),
        ...(endDate !== "" && { endDate }),
        ...(emailFilter !== "" && { filter: emailFilter }),
        ...(orderDirection !== undefined && { orderDirection }),
        ...(orderBy !== undefined && { orderBy }),
        ...(page && { pageNumber: page }),
        ...(rowsPerPage && { pageSize: rowsPerPage }),
        roleFilter: "professor",
      };

      const res = await apiRequest<{
        result: { users: UserFormData[]; totalPages: number };
      }>({
        method: "get",
        url: `/api/users/`,
        params,
      });
      const { users, totalPages } = res.result;
      setTotalPages(totalPages);
      setProfessors(users);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };

  const createProfessor = async (data: UserFormData) => {
    try {
      await apiRequest({
        method: "post",
        url: `/api/users/professor/create-user`,
        data: data,
      });

      notifySuccess("Cuenta creada exitosamente");
      getProfessors();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      throw error;
    }
  };

  const editProfessor = async (data: UserFormData) => {
    try {
      await apiRequest({
        method: "put",
        url: `/api/users/update`,
        data: data,
      });

      notifySuccess("Creator edited successfully");
      getProfessors();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      throw error;
    }
  };

  const deleteProfessor = async (userId?: string) => {
    if (!userId) {
      notifyError("userId not found");
      throw new Error("userId is required");
    }
    try {
      await apiRequest({
        method: "delete",
        url: `/api/users/${userId}`,
      });

      notifySuccess("Creator removed successfully");
      getProfessors();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    }
  };

  const getStudents = async () => {
    setIsDataLoading(true);
    try {
      const params = {
        pageNumber: page,
        pageSize: rowsPerPage,
        ...(startDate !== "" && { startDate }),
        ...(endDate !== "" && { endDate }),
        ...(emailFilter !== "" && { filter: emailFilter }),
        ...(orderDirection !== undefined && { orderDirection }),
        ...(orderBy !== undefined && { orderBy }),
        ...(page && { pageNumber: page }),
        ...(rowsPerPage && { pageSize: rowsPerPage }),
        roleFilter: "student",
      };

      const res = await apiRequest<{
        result: { users: UserFormData[]; totalPages: number };
      }>({
        method: "get",
        url: `/api/users/`,
        params,
      });
      const { users, totalPages } = res.result;
      setTotalPages(totalPages);
      setStudents(users);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };

  const getProfessorDetails = async (userId: string) => {
    setIsDataLoading(true);
    try {
      const res = await apiRequest<IntProfessorDetails>({
        method: "get",
        url: `/api/users/professorDetails/${userId}`,
      });

      return res;
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };

  const createStudent = async (data: UserFormData) => {
    try {
      await apiRequest({
        method: "post",
        url: `/api/users/creator`,
        data: data,
      });

      notifySuccess("Creator created successfully");
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      throw error;
    }
  };

  const editStudent = async (data: UserFormData) => {
    try {
      await apiRequest({
        method: "put",
        url: `/api/users/update`,
        data: data,
      });

      notifySuccess("Creator edited successfully");
      getStudents();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      throw error;
    }
  };

  const deleteStudent = async (userId?: string) => {
    if (!userId) {
      notifyError("userId not found");
      throw new Error("userId is required");
    }
    try {
      await apiRequest({
        method: "delete",
        url: `/api/users/${userId}`,
      });

      notifySuccess("Creator removed successfully");
      getStudents();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    }
  };

  useEffect(() => {
    if (userType === "professor") {
      getProfessors();
    } else if (userType === "student") {
      getStudents();
    }
  }, [
    userType,
    page,
    rowsPerPage,
    orderDirection,
    orderBy,
    emailFilter,
    startDate,
    endDate,
    companyFilter,
  ]);

  useEffect(() => {
    setPage(1);
    setOrderBy("");
    setOrderDirection("asc");
  }, [userType]);

  return (
    <UserContext.Provider
      value={{
        professors,
        setProfessors,
        students,
        setStudents,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        orderDirection,
        setOrderDirection,
        orderBy,
        setOrderBy,
        isDataLoading,
        totalPages,
        userType,
        setUserType,
        createProfessor,
        editProfessor,
        deleteProfessor,
        createStudent,
        editStudent,
        deleteStudent,
        getProfessorDetails,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
