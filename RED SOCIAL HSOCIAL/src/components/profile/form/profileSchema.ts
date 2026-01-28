
import * as z from "zod";

export const formSchema = z.object({
  username: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(30, "El nombre no puede tener más de 30 caracteres"),
  bio: z.string().max(500, "La biografía no puede tener más de 500 caracteres").optional().or(z.literal("")),
  career: z.string().optional().or(z.literal("")),
  semester: z.string().optional().or(z.literal("")),
  relationship_status: z.string().optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof formSchema>;
