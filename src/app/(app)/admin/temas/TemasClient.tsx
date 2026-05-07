"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import type { Asignatura, TemaWithCounts } from "@/types";

const selectClass =
  "block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

type Props = {
  asignaturas: Asignatura[];
  temas: TemaWithCounts[];
  selectedAsignaturaId: string;
};

export function TemasClient({ asignaturas, temas, selectedAsignaturaId }: Props) {
  const router = useRouter();

  function setAsignaturaFilter(id: string) {
    const params = new URLSearchParams();
    if (id) params.set("asignaturaId", id);
    router.replace(`/admin/temas${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <Card>
      <div>
        <h2 className="text-lg font-semibold">Temas</h2>
        <p className="text-sm text-muted">
          Inventario del banco. Para crear, editar o borrar temas, usa el SQL Editor
          de Supabase.
        </p>
      </div>

      <div className="mt-6 max-w-sm">
        <Label htmlFor="filter-asignatura">Filtrar por asignatura</Label>
        <select
          id="filter-asignatura"
          value={selectedAsignaturaId}
          onChange={(e) => setAsignaturaFilter(e.currentTarget.value)}
          className={selectClass}
        >
          <option value="">Todas</option>
          {asignaturas.map((asignatura) => (
            <option key={asignatura.id} value={asignatura.id}>
              {asignatura.orden}. {asignatura.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-border">
              <th className="py-2 pr-3 font-medium">Orden</th>
              <th className="py-2 pr-3 font-medium">Nombre</th>
              <th className="py-2 pr-3 font-medium">Asignatura</th>
              <th className="py-2 pr-3 font-medium">Preguntas</th>
            </tr>
          </thead>
          <tbody>
            {temas.map((tema) => (
              <tr key={tema.id} className="border-b border-border last:border-0">
                <td className="py-3 pr-3 tabular-nums">{tema.orden}</td>
                <td className="py-3 pr-3">{tema.nombre}</td>
                <td className="py-3 pr-3">{tema.asignatura_nombre}</td>
                <td className="py-3 pr-3 tabular-nums">{tema.preguntas_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
