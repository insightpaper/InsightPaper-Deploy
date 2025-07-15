"use client";
import { useState, useEffect } from "react";
import { useSystemLayout } from "@/shared/context/SystemLayoutProvider";
import { useCourse } from "@/modules/courses/context/CourseProvider";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CardActions,
  Link,
  Skeleton,
  Typography,
} from "@mui/material";
import { Card } from "@mui/material";
import { CardContent } from "@mui/material";

import CreateCourseDialog from "@/modules/courses/components/dialogs/CreateCourseDialog";
import DrawerCourse from "@/modules/courses/components/drawer/DrawerCourse";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import JoinCourseDialog from "@/shared/components/dialogs/JoinCourseDialog";
import { ExpandMore } from "@mui/icons-material";

export default function CoursesPage() {
  const { currentUserData } = useSystemLayout();
  const { courses, setTypeUser, deleteCourse, isDataLoading } = useCourse();
  const role = currentUserData?.roles?.[0].name;
  const isProfessor = role === "Professor" || role === "Admin";
  const [openJoin, setOpenJoin] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [courseId, setCourseId] = useState<string>("");

  useEffect(() => {
    setTypeUser(role);
  }, [role]);

  const handleJoin = () => {
    setOpenJoin(!openJoin);
  };

  const handleDeleteStudent = () => {
    try {
      deleteCourse(courseId);
      setOpenDelete(false);
      setCourseId("");
    } catch {}
  };

  const getFirstParagraph = (text: string) => {
    const htmlString = text || "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const firstParagraph = doc.querySelector("p")?.innerHTML || "";
    return firstParagraph;
  };

  return (
    <main className="flex flex-col w-full min-h-full px-3 lg:px-6 py-12!">
      <div className="flex justify-between w-full gap-4 mb-6">
        <Typography variant="h4">Cursos</Typography>
        {isProfessor && <CreateCourseDialog />}
        {!isProfessor && <Button onClick={handleJoin}>Unirse a curso</Button>}
      </div>
      <ConfirmationDialog
        cancelText="Cancelar"
        confirmText="Eliminar"
        content="¿Está seguro que desea eliminar este curso?"
        title="Eliminar curso"
        isPositiveAction={false}
        isOpen={openDelete}
        onCancel={() => setOpenDelete(false)}
        onConfirm={() => handleDeleteStudent()}
      />
      {isDataLoading && (
        <div className="w-full">
          <Skeleton animation="wave" className="h-16!" />
          <Skeleton animation="wave" className="h-16!" />
          <Skeleton animation="wave" className="h-16!" />
        </div>
      )}

      {courses?.length > 0 &&
        courses.map((course) => (
          <Accordion key={course.year} className="!bg-transparent mb-4!">
            <AccordionSummary
              id={`panel-${course.year}-header`}
              aria-controls={`panel-${course.year}-content`}
              expandIcon={<ExpandMore />}
              className="w-full"
            >
              <Typography variant="h5">{course.year}</Typography>
            </AccordionSummary>
            <AccordionDetails className="grid !bg-transparent grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {course.courses.map((course) => (
                <Card
                  key={course.courseId}
                  className="w-full flex flex-col justify-between"
                  sx={{ minHeight: "100px", maxHeight: "200px" }}
                >
                  <CardContent>
                    <Link href={`/courses/${course.courseId}`} underline="none">
                      <Typography variant="h5" className="line-clamp-1">
                        {course.name}
                      </Typography>
                    </Link>
                    <Typography
                      variant="body2"
                      className="mt-4 line-clamp-2 !text-gray-400"
                    >
                      {getFirstParagraph(course.description)}
                    </Typography>
                  </CardContent>
                  {isProfessor && (
                    <CardActions className="flex justify-end">
                      <DrawerCourse data={course} />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setOpenDelete(true);
                          setCourseId(course.courseId);
                        }}
                        color="error"
                        size="small"
                      >
                        Eliminar
                      </Button>
                    </CardActions>
                  )}
                </Card>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      <JoinCourseDialog openDialog={openJoin} setOpenDialog={setOpenJoin} />
    </main>
  );
}
