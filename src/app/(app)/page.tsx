import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { listAsignaturasWithCounts } from "@/lib/db";

export default async function Home() {
  const asignaturas = await listAsignaturasWithCounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Asignaturas</h1>
        <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-3 text-muted">
          Elige una asignatura para preparar un test.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {asignaturas.map((asignatura) => (
          <Link key={asignatura.id} href={`/asignaturas/${asignatura.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <p className="text-sm font-medium text-primary">Asignatura {asignatura.orden}</p>
              <h2 className="mt-2 text-xl font-semibold">{asignatura.nombre}</h2>
              <p className="mt-3 text-sm text-muted">
                {asignatura.temas_count} temas · {asignatura.preguntas_count} preguntas
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
