"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MediaPorAsignaturaItem } from "@/types";

type Props = { data: MediaPorAsignaturaItem[] };

export function MediaPorAsignaturaChart({ data }: Props) {
  const chartData = data.map((m) => ({
    name: `${m.asignatura_orden}`,
    fullName: m.asignatura_nombre,
    media: m.n_tests > 0 ? m.media : null,
    n_tests: m.n_tests,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, _name, props) => {
            const tests = (props.payload as { n_tests?: number } | undefined)?.n_tests ?? 0;
            if (tests === 0) return ["—", "Sin tests"];
            return [`${value} / 10`, `${tests} test${tests === 1 ? "" : "s"}`];
          }}
          labelFormatter={(_, payload) => {
            const p = payload?.[0]?.payload as { fullName?: string } | undefined;
            return p?.fullName ?? "";
          }}
          contentStyle={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 8,
          }}
        />
        <Bar dataKey="media" fill="var(--primary)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
