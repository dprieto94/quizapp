"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  countPreguntasRealesByAsignatura,
  countRecordsRealesPorEncima,
  countTemasYPreguntasByAsignatura,
  getPosicionJuego,
  getPremioJuego,
  getRankingJuego,
  insertRecordJuego,
} from "@/lib/db";
import { guardarRecordSchema } from "@/lib/validation/juego";
import type { JuegoRecord } from "@/types";

export type GuardarRecordResult = {
  ranking: JuegoRecord[];
  posicion: number;
  entraEnTop10: boolean;
  premio: { text: string; unlocked: boolean } | null;
  justUnlocked: boolean;
};

export async function guardarRecordJuego(
  input: unknown,
): Promise<GuardarRecordResult> {
  const session = await getSession();
  if (!session) redirect("/login");

  const { asignaturaId, modalidad, vidas, aciertos } =
    guardarRecordSchema.parse(input);

  // Cota anti-trampa: aciertos no puede exceder el tamaño de la pool jugada.
  const poolSize =
    modalidad === "reales"
      ? await countPreguntasRealesByAsignatura(asignaturaId)
      : (await countTemasYPreguntasByAsignatura(asignaturaId)).preguntas;
  if (aciertos > poolSize) throw new Error("Puntuación imposible para esta pool");

  const premio = await getPremioJuego(asignaturaId);
  const realesPorEncimaAntes = premio
    ? await countRecordsRealesPorEncima(asignaturaId, premio.threshold)
    : 0;

  await insertRecordJuego({
    asignatura_id: asignaturaId,
    user_id: session.userId,
    nombre: session.username,
    aciertos,
    vidas_iniciales: vidas,
    modalidad,
    es_fake: false,
    premio: null,
  });

  const [ranking, posicion] = await Promise.all([
    getRankingJuego(asignaturaId, 10),
    getPosicionJuego(asignaturaId, aciertos),
  ]);

  const justUnlocked =
    premio !== null && realesPorEncimaAntes === 0 && aciertos > premio.threshold;
  const premioState = premio
    ? {
        text: premio.premio,
        unlocked: realesPorEncimaAntes > 0 || aciertos > premio.threshold,
      }
    : null;

  revalidatePath(`/asignaturas/${asignaturaId}/juego`);

  return {
    ranking,
    posicion,
    entraEnTop10: posicion <= 10 && aciertos > 0,
    premio: premioState,
    justUnlocked,
  };
}
