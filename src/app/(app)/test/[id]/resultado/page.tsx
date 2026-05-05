import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { getTestWithRespuestas } from "@/lib/db";
import type { Opcion, TestRespuestaDetalle } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
};

const optionLabels: Record<Opcion, string> = { a: "A", b: "B", c: "C" };

function estadoRespuesta(respuesta: TestRespuestaDetalle) {
  if (respuesta.opcion_marcada === null) return "blanco";
  if (respuesta.opcion_marcada === respuesta.pregunta.correcta) return "correcta";
  return "incorrecta";
}

function OptionLine({
  option,
  text,
  marcada,
  correcta,
}: {
  option: Opcion;
  text: string;
  marcada: boolean;
  correcta: boolean;
}) {
  return (
    <li
      className={cn(
        "rounded-lg border px-3 py-2 text-sm",
        correcta
          ? "border-success bg-primary-soft"
          : marcada
            ? "border-danger bg-danger/10"
            : "border-border",
      )}
    >
      <span className="font-semibold">{optionLabels[option]}.</span> {text}
      {correcta ? <Badge variant="success" className="ml-2">Correcta</Badge> : null}
      {marcada && !correcta ? <Badge variant="danger" className="ml-2">Marcada</Badge> : null}
    </li>
  );
}

export default async function ResultadoPage({ params }: Props) {
  const { id } = await params;
  const test = await getTestWithRespuestas(id);
  if (!test) notFound();

  const total = test.aciertos + test.fallos + test.blancos;
  const porcentaje = total ? Math.round((test.aciertos / total) * 100) : 0;
  const repeatUrl = `/asignaturas/${test.asignatura_id}/empezar?${new URLSearchParams({
    modalidad: test.modalidad,
    modo: test.modo,
    ...(test.tema_id ? { tema: test.tema_id } : {}),
  }).toString()}`;

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <p className="text-sm font-medium text-primary">Resultado · {test.asignatura_nombre}</p>
        <h1 className="mt-3 text-5xl font-semibold tabular-nums">
          {test.modo === "examen" ? (test.nota ?? 0).toFixed(2) : `${porcentaje}%`}
        </h1>
        <p className="mt-2 text-muted">
          {test.modo === "examen" ? "Nota sobre 10" : "Porcentaje de aciertos"}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Badge variant="success">{test.aciertos} aciertos</Badge>
          <Badge variant="danger">{test.fallos} fallos</Badge>
          <Badge variant="neutral">{test.blancos} en blanco</Badge>
          <Badge>{test.modalidad === "tema" ? test.tema_nombre : "Asignatura completa"}</Badge>
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={repeatUrl}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Repetir test
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-primary-soft"
        >
          Volver al inicio
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Detalle de preguntas</h2>
        {test.respuestas.map((respuesta, index) => {
          const estado = estadoRespuesta(respuesta);
          return (
            <details key={respuesta.id} className="rounded-xl border border-border bg-background p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium">{index + 1}. {respuesta.pregunta.enunciado}</span>
                  <span className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        estado === "correcta"
                          ? "success"
                          : estado === "incorrecta"
                            ? "danger"
                            : "neutral"
                      }
                    >
                      {estado === "correcta" ? "Correcta" : estado === "incorrecta" ? "Incorrecta" : "En blanco"}
                    </Badge>
                    {respuesta.fue_dudosa ? <Badge variant="warning">Dudosa</Badge> : null}
                  </span>
                </div>
              </summary>
              <ul className="mt-4 space-y-2">
                {(["a", "b", "c"] as const).map((option) => (
                  <OptionLine
                    key={option}
                    option={option}
                    text={respuesta.pregunta[`opcion_${option}`]}
                    marcada={respuesta.opcion_marcada === option}
                    correcta={respuesta.pregunta.correcta === option}
                  />
                ))}
              </ul>
            </details>
          );
        })}
      </section>
    </div>
  );
}
