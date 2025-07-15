import { z } from "zod";

export type UserFormData = z.infer<typeof userSchema>;

export const userSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address")
});
