import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAsignatura, getConfig, listTemasByAsignatura } from "@/lib/db";
import { StartTestForm } from "./StartTestForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AsignaturaPage({ params }: Props) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const [asignatura, temas, config] = await Promise.all([
    getAsignatura(id),
    listTemasByAsignatura(id),
    getConfig(session.userId),
  ]);

  if (!asignatura) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-primary hover:underline">
          Volver a asignaturas
        </Link>
        <h1 className="mt-3 text-3xl font-semibold">{asignatura.nombre}</h1>
        <p className="mt-2 text-muted">
          Configura el test. Si todavía no hay preguntas, se mostrará un aviso antes de empezar.
        </p>
      </div>

      {temas.length ? (
        <StartTestForm
          asignatura={asignatura}
          temas={temas}
          timerMinutos={config.timer_minutos}
          penalizacion={config.penalizacion}
          preguntasPorTest={config.preguntas_por_test}
        />
      ) : (
        <div className="rounded-xl border border-border bg-primary-soft p-5">
          <h2 className="font-semibold text-primary">No hay temas en esta asignatura</h2>
          <p className="mt-2 text-sm text-muted">Crea temas desde el admin antes de preparar un test.</p>
          <Link
            href="/admin/temas"
            className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Ir a temas
          </Link>
        </div>
      )}
    </div>
  );
}
