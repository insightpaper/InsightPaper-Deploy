import { z } from "zod";

const forgotPasswordSchema = z.object({
  password: z
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
  otp: z
    .string()
    .length(6, "El OTP debe tener exactamente 6 caracteres")
    .regex(/^\d+$/, "El OTP debe contener solo dígitos")
    .nonempty("El OTP es obligatorio"),
  email: z
    .string()
    .email("Dirección de correo electrónico no válida")
    .nonempty("El correo electrónico es obligatorio"),
});

// Tipo de TypeScript inferido del esquema de Zod
export type FormData = z.infer<typeof forgotPasswordSchema>;

export default forgotPasswordSchema;
