import { Card } from "@/components/ui/Card";
import type { AsignaturaWithCounts } from "@/types";

type Props = {
  asignaturas: AsignaturaWithCounts[];
};

export function AsignaturasClient({ asignaturas }: Props) {
  return (
    <Card>
      <div>
        <h2 className="text-lg font-semibold">Asignaturas</h2>
        <p className="text-sm text-muted">
          Inventario del banco. Para crear, editar o borrar asignaturas, usa el SQL
          Editor de Supabase.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-border">
              <th className="py-2 pr-3 font-medium">Orden</th>
              <th className="py-2 pr-3 font-medium">Nombre</th>
              <th className="py-2 pr-3 font-medium">Temas</th>
              <th className="py-2 pr-3 font-medium">Preguntas</th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.map((asignatura) => (
              <tr
                key={asignatura.id}
                className="border-b border-border last:border-0"
              >
                <td className="py-3 pr-3 tabular-nums">{asignatura.orden}</td>
                <td className="py-3 pr-3">{asignatura.nombre}</td>
                <td className="py-3 pr-3 tabular-nums">{asignatura.temas_count}</td>
                <td className="py-3 pr-3 tabular-nums">
                  {asignatura.preguntas_count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
