"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Asignatura, Tema } from "@/types";

type Props = {
  asignatura: Asignatura;
  temas: Tema[];
  timerMinutos: number;
  penalizacion: number;
  preguntasPorTest: number;
};

const radioCard =
  "flex cursor-pointer gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft";

export function StartTestForm({
  asignatura,
  temas,
  timerMinutos,
  penalizacion,
  preguntasPorTest,
}: Props) {
  const router = useRouter();
  const [modalidad, setModalidad] = useState<"temas" | "asignatura">("temas");
  const [modo, setModo] = useState<"examen" | "estudio">("examen");
  const [selectedTemas, setSelectedTemas] = useState<Set<string>>(
    () => new Set(temas.length ? [temas[0].id] : []),
  );

  function toggleTema(id: string) {
    setSelectedTemas((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedTemas(new Set(temas.map((t) => t.id)));
  }

  function selectNone() {
    setSelectedTemas(new Set());
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams({ modalidad, modo });
    if (modalidad === "temas") {
      const ids = Array.from(selectedTemas);
      if (!ids.length) return;
      params.set("temas", ids.join(","));
    }
    router.push(`/asignaturas/${asignatura.id}/empezar?${params.toString()}`);
  }

  const noTemasSelected = modalidad === "temas" && selectedTemas.size === 0;

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold">Modalidad</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={radioCard}>
            <input
              type="radio"
              name="modalidad"
              value="temas"
              checked={modalidad === "temas"}
              onChange={() => setModalidad("temas")}
            />
            <span>
              <strong>Selección de temas</strong>
              <span className="mt-1 block text-sm text-muted">
                Elige uno o varios temas con los checkboxes.
              </span>
            </span>
          </label>
          <label className={radioCard}>
            <input
              type="radio"
              name="modalidad"
              value="asignatura"
              checked={modalidad === "asignatura"}
              onChange={() => setModalidad("asignatura")}
            />
            <span>
              <strong>Asignatura completa</strong>
              <span className="mt-1 block text-sm text-muted">
                Preguntas aleatorias de todos los temas.
              </span>
            </span>
          </label>
        </div>

        {modalidad === "temas" ? (
          <div className="mt-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">
                Temas seleccionados:{" "}
                <span className="tabular-nums">{selectedTemas.size}</span> /{" "}
                {temas.length}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                  Marcar todos
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={selectNone}>
                  Desmarcar todos
                </Button>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {temas.map((tema) => {
                const checked = selectedTemas.has(tema.id);
                return (
                  <label
                    key={tema.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTema(tema.id)}
                      className="size-4"
                    />
                    <span className="text-sm">
                      <span className="font-medium">{tema.orden}.</span> {tema.nombre}
                    </span>
                  </label>
                );
              })}
            </div>
            {noTemasSelected ? (
              <p className="text-xs text-danger">Marca al menos un tema para continuar.</p>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Modo</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={radioCard}>
            <input
              type="radio"
              name="modo"
              value="examen"
              checked={modo === "examen"}
              onChange={() => setModo("examen")}
            />
            <span>
              <strong>Examen</strong>
              <span className="mt-1 block text-sm text-muted">
                Timer {timerMinutos} min, penalización {penalizacion} por fallo, nota
                sobre 10. Test de {preguntasPorTest} preguntas.
              </span>
            </span>
          </label>
          <label className={radioCard}>
            <input
              type="radio"
              name="modo"
              value="estudio"
              checked={modo === "estudio"}
              onChange={() => setModo("estudio")}
            />
            <span>
              <strong>Estudio</strong>
              <span className="mt-1 block text-sm text-muted">
                Sin timer, feedback inmediato pregunta a pregunta. Sin nota — porcentaje
                de aciertos.
              </span>
            </span>
          </label>
        </div>
      </Card>

      <Button
        type="submit"
        size="lg"
        disabled={noTemasSelected}
        className="w-full shadow-[0_3px_0_var(--primary-hover)] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-hover)] sm:w-auto"
      >
        Empezar test
      </Button>
    </form>
  );
}
