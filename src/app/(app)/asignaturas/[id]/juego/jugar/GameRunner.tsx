"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { QuestionCard } from "@/components/test/QuestionCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { CorrectasMap, JuegoModalidad, Opcion, PreguntaPublica } from "@/types";
import { Clasificacion } from "../Clasificacion";
import { guardarRecordJuego, type GuardarRecordResult } from "./actions";

type Props = {
  asignaturaId: string;
  modalidad: JuegoModalidad;
  vidasIniciales: number;
  preguntas: PreguntaPublica[];
  correctas: CorrectasMap;
};

export function GameRunner({
  asignaturaId,
  modalidad,
  vidasIniciales,
  preguntas,
  correctas,
}: Props) {
  const total = preguntas.length;
  const [vidas, setVidas] = useState(vidasIniciales);
  const [aciertos, setAciertos] = useState(0);
  const [index, setIndex] = useState(0);
  const [seleccion, setSeleccion] = useState<Opcion | null>(null);
  const [fin, setFin] = useState<"sin-vidas" | "completada" | null>(null);
  const [resultado, setResultado] = useState<GuardarRecordResult | null>(null);
  const [isSaving, startTransition] = useTransition();
  const savedRef = useRef(false);

  const pregunta = preguntas[index];
  const correcta = pregunta ? correctas[pregunta.id] : undefined;
  const revealed = seleccion !== null;

  // Al responder se fija la opción (dispara el reveal y, si se falla, el panel de
  // justificación de QuestionCard) y se aplica la consecuencia: suma o resta vida.
  function handleSelect(opcion: Opcion) {
    if (revealed) return;
    setSeleccion(opcion);
    if (opcion === correcta) setAciertos((a) => a + 1);
    else setVidas((v) => v - 1);
  }

  // ¿La respuesta ya contestada termina la partida? (vidas/aciertos ya actualizados).
  const partidaTermina = revealed && (vidas <= 0 || index + 1 >= total);

  // "Continuar": avanza a la siguiente o, si la partida termina, muestra el
  // resultado y guarda el récord una sola vez.
  function handleContinuar() {
    if (!partidaTermina) {
      setIndex((i) => i + 1);
      setSeleccion(null);
      return;
    }
    setFin(vidas <= 0 ? "sin-vidas" : "completada");
    if (!savedRef.current) {
      savedRef.current = true;
      startTransition(async () => {
        const r = await guardarRecordJuego({
          asignaturaId,
          modalidad,
          vidas: vidasIniciales,
          aciertos,
        });
        setResultado(r);
      });
    }
  }

  if (fin) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <Card className="text-center">
          <p className="text-sm font-medium text-primary">
            {fin === "completada" ? "¡Completada!" : "¡Sin vidas!"}
          </p>
          <h1 className="mt-3 text-5xl font-semibold tabular-nums">{aciertos}</h1>
          <p className="mt-2 text-muted">{aciertos === 1 ? "acierto" : "aciertos"}</p>

          {isSaving ? (
            <p className="mt-5 text-sm text-muted">Guardando tu récord…</p>
          ) : null}

          {resultado ? (
            <div className="mt-5 space-y-2">
              <p className="text-sm">
                Has quedado <strong>#{resultado.posicion}</strong>
                {resultado.entraEnTop10 ? " — ¡estás en el top 10!" : ""}.
              </p>
              {resultado.justUnlocked && resultado.premio ? (
                <p className="rounded-lg border border-primary bg-primary-soft px-3 py-2 text-sm font-semibold text-primary">
                  🎉 ¡Has desbloqueado el premio: {resultado.premio.text}!
                </p>
              ) : null}
            </div>
          ) : null}
        </Card>

        {resultado ? (
          <Clasificacion
            ranking={resultado.ranking}
            premioTexto={resultado.premio?.text ?? null}
            desbloqueado={resultado.premio?.unlocked ?? false}
          />
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/asignaturas/${asignaturaId}/juego/jugar?modalidad=${modalidad}&vidas=${vidasIniciales}`}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Jugar otra vez
          </Link>
          <Link
            href={`/asignaturas/${asignaturaId}/juego`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-primary-soft"
          >
            Volver al Modo Juego
          </Link>
        </div>
      </div>
    );
  }

  if (!pregunta) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <p className="text-sm font-medium">
          Aciertos: <span className="tabular-nums">{aciertos}</span>
        </p>
        <div className="flex gap-1" aria-label={`${vidas} de ${vidasIniciales} vidas`}>
          {Array.from({ length: vidasIniciales }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "size-6 transition-colors",
                i < vidas ? "fill-current text-danger" : "text-neutral",
              )}
              aria-hidden="true"
            />
          ))}
        </div>
      </header>

      <div className="mt-6">
        <QuestionCard
          pregunta={pregunta}
          seleccionada={seleccion}
          correcta={correcta}
          onSelect={handleSelect}
        />
      </div>

      <div className="mt-5 flex justify-center">
        {revealed ? (
          <Button
            type="button"
            onClick={handleContinuar}
            className="w-full sm:w-auto sm:min-w-48"
          >
            {partidaTermina ? "Ver resultado" : "Continuar"}
          </Button>
        ) : (
          <p className="text-center text-xs text-muted">
            Acierta para seguir. Si fallas, pierdes una vida.
          </p>
        )}
      </div>
    </div>
  );
}
