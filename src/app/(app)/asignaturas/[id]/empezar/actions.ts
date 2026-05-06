"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import {
  createTestWithRespuestas,
  getConfig,
  getCorrectasByPreguntaIds,
} from "@/lib/db";
import { calcularNota } from "@/lib/scoring";

const respuestaSchema = z.object({
  pregunta_id: z.string().uuid(),
  opcion_marcada: z.enum(["a", "b", "c"]).nullable(),
  fue_dudosa: z.boolean(),
  orden: z.number().int().nonnegative(),
});

const payloadSchema = z.object({
  asignaturaId: z.string().uuid(),
  temaId: z.string().uuid().nullable(),
  modo: z.enum(["examen", "estudio"]),
  modalidad: z.enum(["tema", "asignatura"]),
  respuestas: z.array(respuestaSchema).min(1).max(20),
});

export async function finalizarTest(input: unknown) {
  const session = await getSession();
  if (!session) redirect("/login");

  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) throw new Error("Payload de test inválido");

  const { asignaturaId, temaId, modo, modalidad, respuestas } = parsed.data;
  if (modalidad === "tema" && !temaId) throw new Error("Tema requerido");

  const correctas = await getCorrectasByPreguntaIds(
    respuestas.map((respuesta) => respuesta.pregunta_id),
  );
  if (correctas.length !== respuestas.length) {
    throw new Error("Alguna pregunta del test ya no existe");
  }

  const correctasById = new Map(correctas.map((pregunta) => [pregunta.id, pregunta]));
  let aciertos = 0;
  let fallos = 0;
  let blancos = 0;

  for (const respuesta of respuestas) {
    const pregunta = correctasById.get(respuesta.pregunta_id);
    if (!pregunta) throw new Error("Pregunta inválida");
    if (pregunta.asignatura_id !== asignaturaId) throw new Error("Pregunta fuera de asignatura");
    if (modalidad === "tema" && pregunta.tema_id !== temaId) {
      throw new Error("Pregunta fuera de tema");
    }

    if (respuesta.opcion_marcada === null) blancos++;
    else if (respuesta.opcion_marcada === pregunta.correcta) aciertos++;
    else fallos++;
  }

  const config = await getConfig();
  const nota =
    modo === "examen"
      ? calcularNota(aciertos, fallos, config.penalizacion, respuestas.length)
      : null;

  const { id } = await createTestWithRespuestas({
    modo,
    modalidad,
    asignatura_id: asignaturaId,
    tema_id: modalidad === "tema" ? temaId : null,
    penalizacion: modo === "estudio" ? 0 : config.penalizacion,
    timer_minutos: modo === "examen" ? config.timer_minutos : null,
    aciertos,
    fallos,
    blancos,
    nota,
    respuestas,
  });

  redirect(`/test/${id}/resultado`);
}
