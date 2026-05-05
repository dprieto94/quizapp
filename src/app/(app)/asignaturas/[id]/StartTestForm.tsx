"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import type { Asignatura, Tema } from "@/types";

type Props = {
  asignatura: Asignatura;
  temas: Tema[];
  timerMinutos: number;
  penalizacion: number;
};

const radioCard =
  "flex cursor-pointer gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft";
const selectClass =
  "block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export function StartTestForm({ asignatura, temas, timerMinutos, penalizacion }: Props) {
  const router = useRouter();
  const [modalidad, setModalidad] = useState<"tema" | "asignatura">("tema");
  const [temaId, setTemaId] = useState(temas[0]?.id ?? "");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams({ modalidad, modo: "examen" });
    if (modalidad === "tema") params.set("tema", temaId);
    router.push(`/asignaturas/${asignatura.id}/empezar?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold">Modalidad</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={radioCard}>
            <input
              type="radio"
              name="modalidad"
              value="tema"
              checked={modalidad === "tema"}
              onChange={() => setModalidad("tema")}
            />
            <span>
              <strong>Test por tema</strong>
              <span className="mt-1 block text-sm text-muted">Preguntas solo del tema elegido.</span>
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
              <span className="mt-1 block text-sm text-muted">Preguntas aleatorias de todos sus temas.</span>
            </span>
          </label>
        </div>

        {modalidad === "tema" ? (
          <div className="mt-4">
            <Label htmlFor="tema">Tema</Label>
            <select
              id="tema"
              value={temaId}
              onChange={(e) => setTemaId(e.currentTarget.value)}
              className={selectClass}
              disabled={!temas.length}
            >
              {temas.map((tema) => (
                <option key={tema.id} value={tema.id}>
                  {tema.orden}. {tema.nombre}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Modo</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={radioCard}>
            <input type="radio" name="modo" value="examen" defaultChecked />
            <span>
              <strong>Examen</strong>
              <span className="mt-1 block text-sm text-muted">
                Timer {timerMinutos} min, penalización {penalizacion} por fallo, nota sobre 10.
              </span>
            </span>
          </label>
          <label className="flex cursor-not-allowed gap-3 rounded-xl border border-border p-4 opacity-60">
            <input type="radio" name="modo" value="estudio" disabled />
            <span>
              <strong>Estudio</strong>
              <span className="mt-1 block text-sm text-muted">Se activará en la Fase 8.</span>
            </span>
          </label>
        </div>
      </Card>

      <Button
        type="submit"
        size="lg"
        disabled={modalidad === "tema" && !temaId}
        className="w-full shadow-[0_3px_0_var(--primary-hover)] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-hover)] sm:w-auto"
      >
        Empezar test
      </Button>
    </form>
  );
}
