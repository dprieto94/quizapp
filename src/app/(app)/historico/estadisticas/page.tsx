import { Card } from "@/components/ui/Card";
import { EvolucionChart } from "@/components/historico/charts/EvolucionChart";
import { MediaPorAsignaturaChart } from "@/components/historico/charts/MediaPorAsignaturaChart";
import { getEvolucionExamen, getMediaPorAsignaturaExamen } from "@/lib/db";

export default async function EstadisticasPage() {
  const [media, evolucion] = await Promise.all([
    getMediaPorAsignaturaExamen(),
    getEvolucionExamen(20),
  ]);

  const totalExamenTests = media.reduce((sum, m) => sum + m.n_tests, 0);

  if (totalExamenTests === 0) {
    return (
      <Card className="py-10 text-center">
        <h2 className="text-lg font-semibold">Aún no hay tests en modo Examen</h2>
        <p className="mt-2 text-muted">
          Las estadísticas se calculan a partir de tests en modo Examen. Haz al menos
          uno para empezar a ver tu media y evolución.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold">Media por asignatura</h2>
        <p className="mt-1 text-sm text-muted">
          Promedio de notas en modo Examen por cada asignatura.
        </p>
        <div className="mt-6 h-72">
          <MediaPorAsignaturaChart data={media} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Evolución</h2>
        <p className="mt-1 text-sm text-muted">
          Tus últimos {evolucion.length} tests en modo Examen, ordenados por fecha.
        </p>
        <div className="mt-6 h-72">
          <EvolucionChart data={evolucion} />
        </div>
      </Card>
    </div>
  );
}
