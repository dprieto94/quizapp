"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import type {
  CorrectasMap,
  Modalidad,
  Modo,
  Opcion,
  PreguntaPublica,
  RespuestaEntrega,
} from "@/types";
import { QuestionCard } from "./QuestionCard";
import { Timer } from "./Timer";
import { finalizarTest } from "@/app/(app)/asignaturas/[id]/empezar/actions";

type Props = {
  asignaturaId: string;
  temaId: string | null;
  modo: Modo;
  modalidad: Modalidad;
  preguntas: PreguntaPublica[];
  timerMinutos: number;
  correctas?: CorrectasMap;
};

export function TestRunner({
  asignaturaId,
  temaId,
  modo,
  modalidad,
  preguntas,
  timerMinutos,
  correctas,
}: Props) {
  const isEstudio = modo === "estudio";
  const [respuestas, setRespuestas] = useState<RespuestaEntrega[]>(() =>
    preguntas.map((pregunta, index) => ({
      pregunta_id: pregunta.id,
      opcion_marcada: null,
      fue_dudosa: false,
      orden: index,
    })),
  );
  const [visiblePosition, setVisiblePosition] = useState(0);
  const [soloDudosas, setSoloDudosas] = useState(false);
  const [repasoOpen, setRepasoOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const submittingRef = useRef(false);
  const respuestasRef = useRef(respuestas);

  useEffect(() => {
    respuestasRef.current = respuestas;
  }, [respuestas]);

  const visibleIndices = soloDudosas
    ? respuestas
        .map((respuesta, index) => (respuesta.fue_dudosa ? index : -1))
        .filter((index) => index >= 0)
    : preguntas.map((_, index) => index);
  const currentIndex = visibleIndices[visiblePosition] ?? 0;
  const currentPregunta = preguntas[currentIndex];
  const currentRespuesta = respuestas[currentIndex];
  const contestadas = respuestas.filter((respuesta) => respuesta.opcion_marcada).length;
  const dudosas = respuestas.filter((respuesta) => respuesta.fue_dudosa).length;
  const blancos = respuestas.length - contestadas;
  const progress = ((currentIndex + 1) / preguntas.length) * 100;
  const aciertosVivo = isEstudio
    ? respuestas.filter(
        (r) => r.opcion_marcada && correctas?.[r.pregunta_id] === r.opcion_marcada,
      ).length
    : 0;

  function updateRespuesta(index: number, patch: Partial<RespuestaEntrega>) {
    setRespuestas((current) =>
      current.map((respuesta, i) => (i === index ? { ...respuesta, ...patch } : respuesta)),
    );
  }

  function selectOpcion(opcion: Opcion) {
    if (isEstudio && currentRespuesta?.opcion_marcada !== null) return;
    updateRespuesta(currentIndex, { opcion_marcada: opcion });
  }

  function go(delta: number) {
    setVisiblePosition((current) =>
      Math.min(Math.max(current + delta, 0), Math.max(visibleIndices.length - 1, 0)),
    );
  }

  function submitNow() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    startTransition(async () => {
      await finalizarTest({
        asignaturaId,
        temaId,
        modo,
        modalidad,
        respuestas: respuestasRef.current,
      });
    });
  }

  function revisarDudosas() {
    if (!dudosas) return;
    setSoloDudosas(true);
    setVisiblePosition(0);
    setRepasoOpen(false);
  }

  if (!currentPregunta || !currentRespuesta) return null;

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <header className="sticky top-0 z-10 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              Pregunta {currentIndex + 1} de {preguntas.length}
            </p>
            {soloDudosas ? (
              <button
                type="button"
                onClick={() => {
                  setSoloDudosas(false);
                  setVisiblePosition(currentIndex);
                }}
                className="text-xs text-primary hover:underline"
              >
                Ver todas
              </button>
            ) : null}
          </div>
          {isEstudio && contestadas > 0 ? (
            <span className="text-sm text-muted tabular-nums">
              {aciertosVivo}/{contestadas} correctas
            </span>
          ) : null}
          {timerMinutos > 0 ? <Timer minutos={timerMinutos} onExpire={submitNow} /> : null}
        </div>
        <ProgressBar value={progress} aria-label="Progreso del test" className="mt-3" />
      </header>

      <div className="mt-6">
        <QuestionCard
          pregunta={currentPregunta}
          seleccionada={currentRespuesta.opcion_marcada}
          dudosa={currentRespuesta.fue_dudosa}
          correcta={isEstudio ? correctas?.[currentPregunta.id] : undefined}
          onSelect={selectOpcion}
          onToggleDudosa={() =>
            updateRespuesta(currentIndex, { fue_dudosa: !currentRespuesta.fue_dudosa })
          }
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {visibleIndices.map((index, position) => {
          const respuesta = respuestas[index];
          const active = index === currentIndex;
          const incorrecta =
            isEstudio &&
            respuesta.opcion_marcada !== null &&
            correctas?.[respuesta.pregunta_id] !== respuesta.opcion_marcada;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setVisiblePosition(position)}
              className={cn(
                "size-10 rounded-lg border text-sm font-medium tabular-nums",
                active
                  ? "border-primary bg-primary text-white"
                  : respuesta.fue_dudosa
                    ? "border-warning bg-warning/20 text-foreground"
                    : incorrecta
                      ? "border-danger/60 bg-danger/10 text-danger"
                      : respuesta.opcion_marcada
                        ? "border-primary-light bg-primary-soft text-primary"
                        : "border-border text-muted",
              )}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => go(-1)}
            disabled={visiblePosition === 0 || isPending}
          >
            Anterior
          </Button>
          {visiblePosition < visibleIndices.length - 1 ? (
            <Button type="button" onClick={() => go(1)} disabled={isPending}>
              Siguiente
            </Button>
          ) : (
            <Button type="button" onClick={() => setRepasoOpen(true)} disabled={isPending}>
              Entregar
            </Button>
          )}
        </div>
      </footer>

      <Modal open={repasoOpen} onClose={() => setRepasoOpen(false)} aria-label="Repaso del test">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">¿Entregar el test?</h2>
            <p className="text-sm text-muted mt-1">Revisa el resumen antes de confirmar.</p>
          </div>
          <ul className="space-y-1 text-sm">
            <li>Contestadas: <strong>{contestadas}</strong></li>
            <li>En blanco: <strong>{blancos}</strong></li>
            <li>Dudosas: <strong>{dudosas}</strong></li>
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {dudosas > 0 ? (
              <Button type="button" variant="ghost" onClick={revisarDudosas}>
                Revisar dudosas
              </Button>
            ) : null}
            <Button type="button" variant="secondary" onClick={() => setRepasoOpen(false)}>
              Volver al test
            </Button>
            <Button type="button" onClick={submitNow} loading={isPending}>
              Confirmar entrega
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
