import { z } from "zod";
const loginSchema = z.object({
  email: z
    .string()
    .email("Correo electrónico no válido")
    .nonempty("El correo electrónico es obligatorio"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type FormData = z.infer<typeof loginSchema>;
export default loginSchema;
