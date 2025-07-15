import CourseProvider from "@/modules/courses/context/CourseProvider";
import StudentCourseProvider from "@/modules/courses/context/StudentsCourseProvider";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <StudentCourseProvider>
      <CourseProvider>{children}</CourseProvider>
    </StudentCourseProvider>
  );
}
