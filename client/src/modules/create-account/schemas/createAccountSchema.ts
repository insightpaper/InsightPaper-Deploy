import { z } from "zod";
const createAccountSchema = z
  .object({
    email: z
      .string()
      .email("Correo electrónico no válido")
      .nonempty("El correo electrónico es obligatorio"),
    name: z.string().nonempty("El nombre es obligatorio"),
    newPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres") // Regla 1: Al menos 8 caracteres
      .nonempty("La contraseña es obligatoria") // General: Campo obligatorio
      .refine((val) => /[A-Z]/.test(val), {
        message: "La contraseña debe contener al menos una letra mayúscula", // Regla 2
      })
      .refine((val) => /[a-z]/.test(val), {
        message: "La contraseña debe contener al menos una letra minúscula", // Regla 3
      })
      .refine((val) => /\d/.test(val), {
        message: "La contraseña debe contener al menos un número", // Regla 4
      })
      .refine((val) => /[!@#$%^&*()\-_=\+\[\]{}|\\;:'",<.>\/?]/.test(val), {
        message:
          "La contraseña debe contener al menos un carácter especial (!@#$%^&*()-_=+[]{}|\\;:'\",<.>/?).", // Regla 5
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas deben coincidir",
    path: ["confirmPassword"],
  });

export type FormData = z.infer<typeof createAccountSchema>;
export default createAccountSchema;
