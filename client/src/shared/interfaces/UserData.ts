import { z } from "zod";

export const RoleSchema = z.object({
  name: z.enum(["Admin", "Professor", "Student"]),
});

export type Role = z.infer<typeof RoleSchema>;

export const userDataSchema = z.object({
  userId: z.string(),
  name: z.string().nonempty("El nombre es requerido"),
  email: z.string().nonempty("El correo es requerido").email("El correo debe tener un formato válido"),
  password: z.string(),
  doubleFactorEnabled: z.boolean(),
  passwordChanged: z.boolean(),
  createdDate: z.string(), // Consider using z.date() if needed
  modifiedDate: z.string(), // Consider using z.date() if needed
  roles: z.array(RoleSchema),
});

export const professorSchema = z.object({
  studentsNumber: z.number().int().positive(),
  courseNumber: z.number().int().positive(),
}).merge(userDataSchema);

export const adminSchema = z
  .object({
    country: z.string().nonempty("Country is required"),
    city: z.string().nonempty("City is required"),
  })
  .merge(userDataSchema.pick({ name: true, email: true }));

export type AdminData = z.infer<typeof adminSchema>;

export type ProfessorData = z.infer<typeof professorSchema>;

export type UserData = z.infer<typeof userDataSchema>;
