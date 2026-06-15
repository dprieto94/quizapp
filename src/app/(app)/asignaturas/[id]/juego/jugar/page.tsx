import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { getSession } from "@/lib/auth";
import { getAsignatura, getRandomPreguntasByAsignatura } from "@/lib/db";
import { shufflePregunta } from "@/lib/shuffle";
import type { CorrectasMap, JuegoModalidad, PreguntaPublica } from "@/types";
import { GameRunner } from "./GameRunner";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function JugarPage({ params, searchParams }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const modalidad: JuegoModalidad =
    sp.modalidad === "reales" ? "reales" : "asignatura";
  const vidas = Math.min(3, Math.max(1, Number(sp.vidas) || 3));

  const asignatura = await getAsignatura(id);
  if (!asignatura) redirect("/");

  // Pool ENTERA y barajada (n grande ⇒ slice no recorta). Sin cap de preguntas_por_test:
  // la partida la recorre sin reponer.
  const preguntas = await getRandomPreguntasByAsignatura(
    id,
    Number.MAX_SAFE_INTEGER,
    { soloReales: modalidad === "reales" },
  );

  if (!preguntas.length) {
    return (
      <Card className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Aún no hay preguntas disponibles</h1>
        <p className="mt-3 text-muted">
          No se ha encontrado ninguna pregunta para{" "}
          {modalidad === "reales"
            ? "el examen real de esta asignatura"
            : "esta asignatura"}
          .
        </p>
        <div className="mt-6">
          <Link
            href={`/asignaturas/${id}/juego`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-primary-soft"
          >
            Volver al Modo Juego
          </Link>
        </div>
      </Card>
    );
  }

  // Shuffle de opciones (neutraliza el sesgo a/b/c, igual que el test). No se
  // persiste: el juego no tiene pantalla de resultado reconstruible.
  const seed = crypto.randomUUID();
  const barajadas = preguntas.map((p) => shufflePregunta(p, seed));

  const publicPreguntas: PreguntaPublica[] = barajadas.map((p) => ({
    id: p.id,
    tema_id: p.tema_id,
    enunciado: p.enunciado,
    opcion_a: p.opcion_a,
    opcion_b: p.opcion_b,
    opcion_c: p.opcion_c,
    justificacion: p.justificacion,
    fuente: p.fuente,
    tema_nombre: p.tema_nombre,
  }));
  const correctas: CorrectasMap = Object.fromEntries(
    barajadas.map((p) => [p.id, p.correcta]),
  );

  return (
    <GameRunner
      asignaturaId={id}
      modalidad={modalidad}
      vidasIniciales={vidas}
      preguntas={publicPreguntas}
      correctas={correctas}
    />
  );
}
