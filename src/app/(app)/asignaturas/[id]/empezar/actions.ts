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
import { correctaTrasShuffle } from "@/lib/shuffle";

const respuestaSchema = z.object({
  pregunta_id: z.string().uuid(),
  opcion_marcada: z.enum(["a", "b", "c"]).nullable(),
  fue_dudosa: z.boolean(),
  orden: z.number().int().nonnegative(),
});

const payloadSchema = z.object({
  asignaturaId: z.string().uuid(),
  temaIds: z.array(z.string().uuid()).max(50),
  modo: z.enum(["examen", "estudio"]),
  modalidad: z.enum(["temas", "asignatura"]),
  testSeed: z.string().uuid(),
  respuestas: z.array(respuestaSchema).min(1).max(30),
});

export async function finalizarTest(input: unknown) {
  const session = await getSession();
  if (!session) redirect("/login");

  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) throw new Error("Payload de test inválido");

  const { asignaturaId, temaIds, modo, modalidad, testSeed, respuestas } = parsed.data;
  if (modalidad === "temas" && temaIds.length === 0) {
    throw new Error("Modalidad 'temas' requiere al menos un tema seleccionado");
  }

  const correctas = await getCorrectasByPreguntaIds(
    respuestas.map((r) => r.pregunta_id),
  );
  if (correctas.length !== respuestas.length) {
    throw new Error("Alguna pregunta del test ya no existe");
  }

  const correctasById = new Map(correctas.map((p) => [p.id, p]));
  const allowedTemaIds = new Set(temaIds);
  let aciertos = 0;
  let fallos = 0;
  let blancos = 0;

  for (const respuesta of respuestas) {
    const pregunta = correctasById.get(respuesta.pregunta_id);
    if (!pregunta) throw new Error("Pregunta inválida");
    if (pregunta.asignatura_id !== asignaturaId) {
      throw new Error("Pregunta fuera de asignatura");
    }
    if (modalidad === "temas" && !allowedTemaIds.has(pregunta.tema_id)) {
      throw new Error("Pregunta fuera de los temas seleccionados");
    }

    // La letra correcta tras el shuffle aplicado al renderizar el test —
    // que es la que la usuaria realmente vio y pulsó.
    const correctaShuffled = correctaTrasShuffle(
      pregunta.id,
      pregunta.correcta,
      testSeed,
    );

    if (respuesta.opcion_marcada === null) blancos++;
    else if (respuesta.opcion_marcada === correctaShuffled) aciertos++;
    else fallos++;
  }

  const config = await getConfig(session.userId);
  const nota =
    modo === "examen"
      ? calcularNota(aciertos, fallos, config.penalizacion, respuestas.length)
      : null;

  const { id } = await createTestWithRespuestas({
    user_id: session.userId,
    modo,
    modalidad,
    asignatura_id: asignaturaId,
    preguntas_por_test: respuestas.length,
    penalizacion: modo === "estudio" ? 0 : config.penalizacion,
    timer_minutos: modo === "examen" ? config.timer_minutos : null,
    aciertos,
    fallos,
    blancos,
    nota,
    shuffle_seed: testSeed,
    tema_ids: modalidad === "temas" ? temaIds : [],
    respuestas,
  });

  redirect(`/test/${id}/resultado`);
}
