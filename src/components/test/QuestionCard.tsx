"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Opcion, PreguntaPublica } from "@/types";

type Props = {
  pregunta: PreguntaPublica;
  seleccionada: Opcion | null;
  dudosa: boolean;
  onSelect: (opcion: Opcion) => void;
  onToggleDudosa: () => void;
};

const opciones: Array<{ key: Opcion; label: string }> = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
];

export function QuestionCard({
  pregunta,
  seleccionada,
  dudosa,
  onSelect,
  onToggleDudosa,
}: Props) {
  return (
    <section className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold leading-relaxed">{pregunta.enunciado}</h2>
        <Button
          type="button"
          variant={dudosa ? "secondary" : "ghost"}
          size="sm"
          onClick={onToggleDudosa}
          aria-pressed={dudosa}
          aria-label={dudosa ? "Quitar marca de dudosa" : "Marcar como dudosa"}
        >
          <Bookmark className={cn("size-4", dudosa ? "fill-primary" : "")} />
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {opciones.map((opcion) => {
          const selected = seleccionada === opcion.key;
          return (
            <button
              key={opcion.key}
              type="button"
              onClick={() => onSelect(opcion.key)}
              className={cn(
                "flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                selected
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-background hover:bg-primary-soft",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                  selected ? "border-primary bg-primary text-white" : "border-border text-muted",
                )}
              >
                {opcion.label}
              </span>
              <span>{pregunta[`opcion_${opcion.key}`]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
