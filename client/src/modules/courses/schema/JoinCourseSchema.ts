import {z} from "zod";

const joinCourseSchema = z.object({
    courseCode: z.string().nonempty("El código del curso es obligatorio").length(5, "El código del curso debe tener 5 caracteres")
    });

export type JoinCourseFormData = z.infer<typeof joinCourseSchema>;
export default joinCourseSchema;