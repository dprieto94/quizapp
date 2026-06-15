import { z } from "zod";

export const juegoModalidadSchema = z.enum(["asignatura", "reales"]);

// Payload del game over → server action `guardarRecordJuego`.
// La cota dura de `aciertos` es laxa aquí; la cota real (tamaño de la pool) se
// valida en el server porque depende de la asignatura y la modalidad.
export const guardarRecordSchema = z.object({
  asignaturaId: z.string().uuid(),
  modalidad: juegoModalidadSchema,
  vidas: z.coerce.number().int().min(1).max(3),
  aciertos: z.coerce.number().int().min(0).max(5000),
});
