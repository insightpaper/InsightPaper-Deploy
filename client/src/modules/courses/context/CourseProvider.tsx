"use client";
import { notifyError, notifySuccess } from "@/shared/utils/toastNotify";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { apiRequest } from "@/shared/utils/request/apiRequest";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";
import { JoinCourseFormData } from "../schema/JoinCourseSchema";
import { CourseFormData } from "../schema/CourseSchema";
import { FormData } from "../schema/CreateCourseSchema";
import { createContext, useContext } from "react";
import { useParams } from "next/navigation";


interface CourseContextType {
  courses: YearGroupedCourses[];
  course: CourseFormData | null;
  isDataLoading: boolean;
  setTypeUser: Dispatch<
    SetStateAction<"Student" | "Professor" | "Admin" | undefined>
  >;
  joinCourse: (data: JoinCourseFormData) => Promise<void>;
  editCourse: (data: FormData) => Promise<void>;
  createCourse: (data: FormData) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  leaveCourse: () => Promise<void>;
}

export interface YearGroupedCourses {
  year: number;
  courses: CourseFormData[];
}

export const CourseContext = createContext<CourseContextType | null>(null);

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
};

function CourseProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [typeUser, setTypeUser] = useState<
    "Student" | "Professor" | "Admin" | undefined
  >(undefined);
  const [courses, setCourses] = useState<YearGroupedCourses[]>([]);
  const [course, setCourse] = useState<CourseFormData | null>(null);
  const { courseId } = useParams<{ courseId: string }>();


  const getCourses = async () => {
    setIsDataLoading(true);
    try {
      if (!typeUser) return;
      const url =
        typeUser == "Professor"
          ? `/api/courses/Professor`
          : `/api/courses/Student`;
      const res = await apiRequest<{
        result: { data: YearGroupedCourses[] };
      }>({
        method: "get",
        url: url,
      });
      const { data } = res.result;
      setCourses(data);
    } catch (error) {
      notifyError(getErrorMessage(error as string));
    } finally {
      setIsDataLoading(false);
    }
  };

  const getCourse = async () => {
    setIsDataLoading(true);
    try{
      //if (!typeUser) return;
      const url = `/api/courses/id/${courseId}`;
      const res = await apiRequest<{ 
        result: CourseFormData
      }>({
        method: "get",
        url: url,
      });
      const { result } = res;
      setCourse(result);
    }catch(error){
      notifyError(getErrorMessage(error as string));
    } finally{
      setIsDataLoading(false);
    }

  }

  const createCourse = async (data: FormData) => {
    try {
      await apiRequest({
        method: "post",
        url: `/api/courses`,
        data: data,
      });
      notifySuccess("Curso creado exitosamente");
      getCourses();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      throw error;
    }
  };

  const joinCourse = async (data: JoinCourseFormData) => {
    try {
      await apiRequest({
        method: "post",
        url: `/api/courses/joinCourse`,
        data: data,
      });
      notifySuccess("Añadido al curso exitosamente");
      getCourses();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      throw error;
    }
  };

  const leaveCourse = async () => {
    try {
      await apiRequest({
        method: "put",
        url: `/api/courses/leaveCourse/${courseId}`,
      });
      notifySuccess("Saliste del curso exitosamente");
      getCourses();
    }catch(error){
      notifyError(getErrorMessage(error as string));
      throw error;
    }
  }
      

  const editCourse = async (data: FormData) => {
    try {
      await apiRequest({
        method: "put",
        url: `/api/courses`,
        data: data,
      });
      notifySuccess("Curso editado exitosamente");
      getCourses();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      throw error;
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      await apiRequest({
        method: "delete",
        url: `/api/courses/${courseId}`,
      });
      notifySuccess("Curso eliminado exitosamente");
      getCourses();
    } catch (error) {
      notifyError(getErrorMessage(error as string));
      throw error;
    }
  };

  useEffect(() => {
    getCourses();
  }, [typeUser]);

  useEffect(()=>{
    if (courseId!==undefined){
      getCourse()
    }
  }, [courseId]);
  return (
    <CourseContext.Provider
      value={{
        courses,
        course,
        setTypeUser,
        isDataLoading,
        joinCourse,
        editCourse,
        createCourse,
        deleteCourse,
        leaveCourse
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export default CourseProvider;
