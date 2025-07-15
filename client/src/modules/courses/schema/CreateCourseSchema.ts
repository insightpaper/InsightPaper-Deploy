import {z} from "zod";

const createCourseSchema = z.object({
    name: z.string().nonempty("El nombre del curso es obligatorio"),
    description: z.string().nonempty("La descripción del curso es obligatoria"),
    semester: z.number().int(),
    courseId: z.string().optional()
})

export type FormData = z.infer<typeof createCourseSchema>;
export default createCourseSchema;