import { z } from "zod";

export const DocumentSchema = z.object({
  documentId: z.string(),
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  //size: z.string(),
  //url: z.string(),
  labels: z.array(z.string()).optional(),
});

export type DocumentFormData = z.infer<typeof DocumentSchema>;

export const CreateDocumentSchema = DocumentSchema.omit({ documentId: true });
export type CreateDocumentFormData = z.infer<typeof CreateDocumentSchema>;

export const EditDocumentSchema = DocumentSchema;
export type EditDocumentFormData = z.infer<typeof EditDocumentSchema>;