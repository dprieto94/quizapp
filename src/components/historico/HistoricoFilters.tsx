"use client";

import { useRouter } from "next/navigation";
import { type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { Asignatura } from "@/types";

const selectClass =
  "block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

type Initial = {
  asignaturaId: string;
  modo: string;
  desde: string;
  hasta: string;
};

type Props = {
  asignaturas: Asignatura[];
  initial: Initial;
};

export function HistoricoFilters({ asignaturas, initial }: Props) {
  const router = useRouter();

  function navigate(next: Partial<Initial>) {
    const params = new URLSearchParams();
    const merged = { ...initial, ...next };
    if (merged.asignaturaId) params.set("asignatura", merged.asignaturaId);
    if (merged.modo) params.set("modo", merged.modo);
    if (merged.desde) params.set("desde", merged.desde);
    if (merged.hasta) params.set("hasta", merged.hasta);
    router.replace(`/historico${params.size ? `?${params.toString()}` : ""}`);
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    navigate({
      asignaturaId: String(fd.get("asignatura") ?? ""),
      modo: String(fd.get("modo") ?? ""),
      desde: String(fd.get("desde") ?? ""),
      hasta: String(fd.get("hasta") ?? ""),
    });
  }

  return (
    <Card>
      <form
        onSubmit={submit}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end"
      >
        <div className="lg:col-span-2">
          <Label htmlFor="asignatura">Asignatura</Label>
          <select
            id="asignatura"
            name="asignatura"
            defaultValue={initial.asignaturaId}
            className={selectClass}
          >
            <option value="">Todas</option>
            {asignaturas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.orden}. {a.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="modo">Modo</Label>
          <select
            id="modo"
            name="modo"
            defaultValue={initial.modo}
            className={selectClass}
          >
            <option value="">Todos</option>
            <option value="examen">Examen</option>
            <option value="estudio">Estudio</option>
          </select>
        </div>
        <div>
          <Label htmlFor="desde">Desde</Label>
          <Input id="desde" name="desde" type="date" defaultValue={initial.desde} />
        </div>
        <div>
          <Label htmlFor="hasta">Hasta</Label>
          <Input id="hasta" name="hasta" type="date" defaultValue={initial.hasta} />
        </div>
        <div className="flex gap-2 lg:col-span-5 lg:justify-end">
          <Button type="submit">Aplicar filtros</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              navigate({ asignaturaId: "", modo: "", desde: "", hasta: "" })
            }
          >
            Limpiar
          </Button>
        </div>
      </form>
    </Card>
  );
}
