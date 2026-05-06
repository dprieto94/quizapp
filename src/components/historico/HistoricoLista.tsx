"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { TestListaItem } from "@/types";

type Props = { tests: TestListaItem[] };

function formatFecha(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTemas(test: TestListaItem) {
  if (test.modalidad === "asignatura") return "Completa";
  if (test.temas.length === 0) return "—";
  if (test.temas.length === 1) return test.temas[0].nombre;
  return `${test.temas.length} temas`;
}

function formatResultado(test: TestListaItem) {
  if (test.modo === "examen") {
    return test.nota !== null ? `${test.nota.toFixed(2)} / 10` : "—";
  }
  const total = test.aciertos + test.fallos + test.blancos;
  const pct = total ? Math.round((test.aciertos / total) * 100) : 0;
  return `${pct}%`;
}

export function HistoricoLista({ tests }: Props) {
  if (!tests.length) {
    return (
      <Card className="py-10 text-center">
        <p className="text-muted">No hay tests con los filtros actuales.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="text-left text-muted">
          <tr className="border-b border-border">
            <th className="py-2 pr-3 font-medium">Fecha</th>
            <th className="py-2 pr-3 font-medium">Asignatura</th>
            <th className="py-2 pr-3 font-medium">Temas</th>
            <th className="py-2 pr-3 font-medium">Modo</th>
            <th className="py-2 pr-3 font-medium">Resultado</th>
            <th className="py-2 pr-3 font-medium tabular-nums">A / F / B</th>
          </tr>
        </thead>
        <tbody>
          {tests.map((t) => (
            <tr
              key={t.id}
              className="border-b border-border last:border-0 hover:bg-primary-soft/40"
            >
              <td className="py-3 pr-3 align-top">
                <Link
                  href={`/test/${t.id}/resultado`}
                  className="block hover:text-primary"
                >
                  {formatFecha(t.fecha)}
                </Link>
              </td>
              <td className="py-3 pr-3 align-top">{t.asignatura_nombre}</td>
              <td className="py-3 pr-3 align-top">{formatTemas(t)}</td>
              <td className="py-3 pr-3 align-top">
                <Badge variant={t.modo === "examen" ? "default" : "neutral"}>
                  {t.modo === "examen" ? "Examen" : "Estudio"}
                </Badge>
              </td>
              <td className="py-3 pr-3 align-top font-medium tabular-nums">
                <Link
                  href={`/test/${t.id}/resultado`}
                  className="hover:text-primary"
                >
                  {formatResultado(t)}
                </Link>
              </td>
              <td className="py-3 pr-3 align-top tabular-nums text-muted">
                {t.aciertos} / {t.fallos} / {t.blancos}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
