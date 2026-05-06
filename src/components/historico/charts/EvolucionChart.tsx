"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TestEvolucionPunto } from "@/types";

type Props = { data: TestEvolucionPunto[] };

function formatFechaCorta(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
}

export function EvolucionChart({ data }: Props) {
  const chartData = data.map((p, i) => ({
    idx: i + 1,
    fecha: formatFechaCorta(p.fecha),
    nota: p.nota,
    asignatura: p.asignatura_nombre,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => [`${value} / 10`, "Nota"]}
          labelFormatter={(_, payload) => {
            const p = payload?.[0]?.payload as
              | { fecha?: string; asignatura?: string }
              | undefined;
            return p ? `${p.fecha} · ${p.asignatura}` : "";
          }}
          contentStyle={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        />
        <Line
          type="monotone"
          dataKey="nota"
          stroke="var(--primary)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--primary)" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
