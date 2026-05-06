"use client";

import { Bookmark, Check, Lightbulb, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Opcion, PreguntaPublica } from "@/types";

type Props = {
  pregunta: PreguntaPublica;
  seleccionada: Opcion | null;
  dudosa: boolean;
  correcta?: Opcion;
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
  correcta,
  onSelect,
  onToggleDudosa,
}: Props) {
  const revealed = correcta !== undefined && seleccionada !== null;
  const acerto = revealed && seleccionada === correcta;

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
          const isSelected = seleccionada === opcion.key;
          const opcionEsCorrecta = revealed && correcta === opcion.key;
          const opcionEsMarcadaIncorrecta =
            revealed && isSelected && correcta !== opcion.key;
          const opcionEsAtenuada =
            revealed && !opcionEsCorrecta && !opcionEsMarcadaIncorrecta;
          const isInteractiveSelected = !revealed && isSelected;

          return (
            <button
              key={opcion.key}
              type="button"
              onClick={() => onSelect(opcion.key)}
              disabled={revealed}
              aria-pressed={isInteractiveSelected || (revealed && isSelected)}
              className={cn(
                "flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                opcionEsCorrecta && "border-success bg-primary-soft text-success",
                opcionEsMarcadaIncorrecta && "border-danger bg-danger/10 text-danger",
                opcionEsAtenuada && "border-border opacity-60",
                isInteractiveSelected && "border-primary bg-primary-soft text-primary",
                !revealed && !isInteractiveSelected && "border-border bg-background hover:bg-primary-soft",
                revealed && "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                  opcionEsCorrecta
                    ? "border-success bg-success text-white"
                    : opcionEsMarcadaIncorrecta
                      ? "border-danger bg-danger text-white"
                      : isInteractiveSelected
                        ? "border-primary bg-primary text-white"
                        : "border-border text-muted",
                )}
              >
                {opcionEsCorrecta ? (
                  <Check className="size-4" />
                ) : opcionEsMarcadaIncorrecta ? (
                  <X className="size-4" />
                ) : (
                  opcion.label
                )}
              </span>
              <span className="flex-1">{pregunta[`opcion_${opcion.key}`]}</span>
              {opcionEsCorrecta ? (
                <Badge variant="success" className="ml-2">Correcta</Badge>
              ) : null}
            </button>
          );
        })}
      </div>

      {revealed && !acerto && (pregunta.justificacion || pregunta.fuente) ? (
        <aside className="mt-5 rounded-r-lg border-l-4 border-primary bg-primary-soft/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Lightbulb className="size-4" /> Justificación
            </h3>
            <span className="text-xs text-muted">
              <span className="font-medium">Tema:</span> {pregunta.tema_nombre}
            </span>
          </div>
          {pregunta.justificacion ? (
            <p className="mt-2 whitespace-pre-line text-sm">{pregunta.justificacion}</p>
          ) : null}
          {pregunta.fuente ? (
            <p
              className={cn(
                "text-xs text-muted",
                pregunta.justificacion ? "mt-3 border-t border-border/60 pt-3" : "mt-2",
              )}
            >
              <span className="font-medium">Fuente:</span> {pregunta.fuente}
            </p>
          ) : null}
        </aside>
      ) : null}

      {revealed ? (
        <p className="sr-only" aria-live="polite">
          {acerto
            ? "Respuesta correcta"
            : `Respuesta incorrecta. La correcta era ${correcta?.toUpperCase()}`}
        </p>
      ) : null}
    </section>
  );
}
