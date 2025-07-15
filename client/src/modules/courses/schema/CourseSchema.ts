import {z} from "zod";

const courseSchema = z.object({
    name: z.string().nonempty("El nombre del curso es obligatorio"),
    description: z.string().nonempty("La descripción del curso es obligatoria"),
    semester: z.number().int(),
    code: z.number().int(),
    professorId: z.number().int(),
    courseId: z.string(),
})

export type CourseFormData = z.infer<typeof courseSchema>;
export default courseSchema;