import { z } from "zod";

const addProfesorSchema = z.object({
  name: z.string().nonempty("El nombre es obligatorio"),
  email: z.string().email("Correo electrónico no válido").nonempty("El correo electrónico es obligatorio")
});

export type FormData = z.infer<typeof addProfesorSchema>;
export default addProfesorSchema;