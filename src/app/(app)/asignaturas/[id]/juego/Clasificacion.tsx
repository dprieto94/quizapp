import { Gift, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { JuegoRecord } from "@/types";

const medallas = ["🥇", "🥈", "🥉"];

type Props = {
  ranking: JuegoRecord[];
  premioTexto: string | null;
  desbloqueado: boolean;
};

export function Clasificacion({ ranking, premioTexto, desbloqueado }: Props) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Trophy className="size-5 text-primary" aria-hidden="true" /> Clasificación
        </h2>
        <span className="text-xs text-muted">Top 10</span>
      </div>

      {desbloqueado && premioTexto ? (
        <p className="mt-3 rounded-lg border border-primary bg-primary-soft px-3 py-2 text-sm font-medium text-primary">
          🎉 Premio desbloqueado: {premioTexto}
        </p>
      ) : null}

      {ranking.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Aún no hay récords. ¡Sé el primero en aparecer aquí!
        </p>
      ) : (
        <ol className="mt-4 space-y-1">
          {ranking.map((record, i) => {
            const llevaPremio = record.premio !== null && !desbloqueado;
            return (
              <li
                key={record.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-2",
                  i % 2 === 1 && "bg-primary-soft/30",
                )}
              >
                <span className="w-7 shrink-0 text-center font-semibold tabular-nums">
                  {medallas[i] ?? `${i + 1}º`}
                </span>
                <span className="flex-1 truncate font-medium">{record.nombre}</span>
                {llevaPremio ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-foreground"
                    title="Hay premio al superar este récord"
                  >
                    <Gift className="size-3.5" aria-hidden="true" /> Premio
                  </span>
                ) : null}
                <span className="shrink-0 font-semibold tabular-nums">{record.aciertos}</span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
