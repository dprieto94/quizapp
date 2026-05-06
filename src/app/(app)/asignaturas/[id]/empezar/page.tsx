import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { TestRunner } from "@/components/test/TestRunner";
import {
  getAsignatura,
  getConfig,
  getRandomPreguntasByAsignatura,
  getRandomPreguntasByTema,
} from "@/lib/db";
import type { Modalidad, Modo, PreguntaPublica } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EmpezarPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  const modalidad: Modalidad = sp.modalidad === "asignatura" ? "asignatura" : "tema";
  const modo: Modo = sp.modo === "estudio" ? "estudio" : "examen";
  const temaId = typeof sp.tema === "string" ? sp.tema : null;

  if (modalidad === "tema" && !temaId) redirect(`/asignaturas/${id}`);

  const asignatura = await getAsignatura(id);
  if (!asignatura) redirect("/");

  const preguntas =
    modalidad === "tema"
      ? await getRandomPreguntasByTema(temaId!, 20)
      : await getRandomPreguntasByAsignatura(id, 20);

  if (!preguntas.length) {
    return (
      <Card className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Aún no hay preguntas disponibles</h1>
        <p className="mt-3 text-muted">
          No se ha encontrado ninguna pregunta para esta {modalidad === "tema" ? "selección de tema" : "asignatura"}.
          Añade preguntas desde el admin y vuelve a intentarlo.
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

  const config = await getConfig();
  const publicPreguntas: PreguntaPublica[] = preguntas.map((pregunta) => ({
    id: pregunta.id,
    tema_id: pregunta.tema_id,
    enunciado: pregunta.enunciado,
    opcion_a: pregunta.opcion_a,
    opcion_b: pregunta.opcion_b,
    opcion_c: pregunta.opcion_c,
  }));
  const correctas =
    modo === "estudio"
      ? Object.fromEntries(preguntas.map((p) => [p.id, p.correcta]))
      : undefined;

  return (
    <TestRunner
      asignaturaId={id}
      temaId={temaId}
      modo={modo}
      modalidad={modalidad}
      preguntas={publicPreguntas}
      timerMinutos={modo === "examen" ? config.timer_minutos : 0}
      correctas={correctas}
    />
  );
}
