import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { TestRunner } from "@/components/test/TestRunner";
import { getSession } from "@/lib/auth";
import {
  getAsignatura,
  getConfig,
  getRandomPreguntasByAsignatura,
  getRandomPreguntasByTemas,
} from "@/lib/db";
import { shufflePregunta } from "@/lib/shuffle";
import type { Modalidad, Modo, PreguntaPublica } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmpezarPage({ params, searchParams }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const modalidad: Modalidad =
    sp.modalidad === "asignatura"
      ? "asignatura"
      : sp.modalidad === "reales"
        ? "reales"
        : "temas";
  const modo: Modo = sp.modo === "estudio" ? "estudio" : "examen";
  const temaIds: string[] =
    modalidad === "temas" && typeof sp.temas === "string"
      ? sp.temas
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

  if (modalidad === "temas" && temaIds.length === 0) redirect(`/asignaturas/${id}`);

  const asignatura = await getAsignatura(id);
  if (!asignatura) redirect("/");

  const config = await getConfig(session.userId);

  const preguntas =
    modalidad === "temas"
      ? await getRandomPreguntasByTemas(temaIds, config.preguntas_por_test)
      : modalidad === "reales"
        ? await getRandomPreguntasByAsignatura(id, config.preguntas_por_test, {
            soloReales: true,
          })
        : await getRandomPreguntasByAsignatura(id, config.preguntas_por_test);

  if (!preguntas.length) {
    return (
      <Card className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Aún no hay preguntas disponibles</h1>
        <p className="mt-3 text-muted">
          No se ha encontrado ninguna pregunta para{" "}
          {modalidad === "temas"
            ? "esta selección de temas"
            : modalidad === "reales"
              ? "el examen real de esta asignatura"
              : "esta asignatura"}
          . Añade preguntas desde el admin y vuelve a intentarlo.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/asignaturas/${id}`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-primary-soft"
          >
            Volver a configurar
          </Link>
          <Link
            href="/admin/preguntas"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Añadir preguntas
          </Link>
        </div>
      </Card>
    );
  }

  // Seed por test: neutraliza el sesgo posicional a/b/c del banco generado por
  // LLM. Se propaga a TestRunner → action y se persiste en `tests.shuffle_seed`
  // para que la pantalla de resultado pueda reconstruir el mismo orden.
  const testSeed = crypto.randomUUID();
  const preguntasShuffleadas = preguntas.map((p) => shufflePregunta(p, testSeed));

  const publicPreguntas: PreguntaPublica[] = preguntasShuffleadas.map((p) => ({
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
  const correctas =
    modo === "estudio"
      ? Object.fromEntries(preguntasShuffleadas.map((p) => [p.id, p.correcta]))
      : undefined;

  return (
    <TestRunner
      asignaturaId={id}
      temaIds={temaIds}
      modo={modo}
      modalidad={modalidad}
      preguntas={publicPreguntas}
      timerMinutos={modo === "examen" ? config.timer_minutos : 0}
      correctas={correctas}
      testSeed={testSeed}
    />
  );
}
