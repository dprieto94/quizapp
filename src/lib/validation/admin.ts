import { z } from "zod";

const optionalLongText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.string().max(max).nullable(),
  );

export const preguntaSchema = z.object({
  tema_id: z.string().uuid(),
  enunciado: z.string().trim().min(10, "Mínimo 10 caracteres").max(2000),
  opcion_a: z.string().trim().min(1, "Obligatorio").max(500),
  opcion_b: z.string().trim().min(1, "Obligatorio").max(500),
  opcion_c: z.string().trim().min(1, "Obligatorio").max(500),
  correcta: z.enum(["a", "b", "c"]),
  justificacion: optionalLongText(4000),
  fuente: optionalLongText(500),
});

export const preguntaUpdateSchema = preguntaSchema.partial();

export type PreguntaFormValues = z.infer<typeof preguntaSchema>;

export const configSchema = z.object({
  penalizacion: z.coerce.number().min(0).max(1),
  timer_minutos: z.coerce.number().int().min(5).max(180),
  preguntas_por_test: z.coerce.number().int().min(20).max(30),
});
