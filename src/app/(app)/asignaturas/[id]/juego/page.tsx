import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  countPreguntasRealesByAsignatura,
  countRecordsRealesPorEncima,
  countTemasYPreguntasByAsignatura,
  getAsignatura,
  getPremioJuego,
  getRankingJuego,
} from "@/lib/db";
import { Clasificacion } from "./Clasificacion";
import { JuegoSetup } from "./JuegoSetup";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JuegoHubPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [asignatura, ranking, premio, realesCount, counts] = await Promise.all([
    getAsignatura(id),
    getRankingJuego(id, 10),
    getPremioJuego(id),
    countPreguntasRealesByAsignatura(id),
    countTemasYPreguntasByAsignatura(id),
  ]);

  if (!asignatura) notFound();

  const premioDesbloqueado =
    premio !== null && (await countRecordsRealesPorEncima(id, premio.threshold)) > 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/asignaturas/${id}`}
          className="text-sm text-primary hover:underline"
        >
          Volver a la asignatura
        </Link>
        <h1 className="mt-3 text-3xl font-semibold">
          Modo Juego · {asignatura.nombre}
        </h1>
        <p className="mt-2 text-muted">
          Acierta para seguir, falla y pierde una vida. Sin vidas, se acaba la
          partida.
        </p>
      </div>

      <Clasificacion
        ranking={ranking}
        premioTexto={premio?.premio ?? null}
        desbloqueado={premioDesbloqueado}
      />

      <JuegoSetup
        asignaturaId={id}
        tieneReales={realesCount > 0}
        realesCount={realesCount}
        totalCount={counts.preguntas}
      />
    </div>
  );
}
