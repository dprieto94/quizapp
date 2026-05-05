import { z } from "zod";

const optionalOrden = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().int().min(1).max(999).optional(),
);

export const asignaturaSchema = z.object({
  nombre: z.string().trim().min(1, "Obligatorio").max(100),
  orden: optionalOrden,
});

export const asignaturaUpdateSchema = asignaturaSchema.partial();

export const temaSchema = z.object({
  asignatura_id: z.string().uuid(),
  nombre: z.string().trim().min(1, "Obligatorio").max(100),
  orden: optionalOrden,
});

export const temaUpdateSchema = temaSchema.partial();

export const preguntaSchema = z.object({
  tema_id: z.string().uuid(),
  enunciado: z.string().trim().min(10, "Mínimo 10 caracteres").max(2000),
  opcion_a: z.string().trim().min(1, "Obligatorio").max(500),
  opcion_b: z.string().trim().min(1, "Obligatorio").max(500),
  opcion_c: z.string().trim().min(1, "Obligatorio").max(500),
  correcta: z.enum(["a", "b", "c"]),
});

export const preguntaUpdateSchema = preguntaSchema.partial();

export type PreguntaFormValues = z.infer<typeof preguntaSchema>;
