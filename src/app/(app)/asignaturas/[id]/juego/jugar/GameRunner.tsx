"use client";

import { Check, Heart, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
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

const REVEAL_MS = 900;

const opciones: Array<{ key: Opcion; label: string }> = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
];

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

  // Tras un breve reveal de acierto/fallo, avanza o termina la partida.
  useEffect(() => {
    if (seleccion === null || fin) return;
    const acerto = seleccion === correcta;
    const timer = setTimeout(() => {
      const nuevasVidas = acerto ? vidas : vidas - 1;
      const nuevosAciertos = acerto ? aciertos + 1 : aciertos;
      setVidas(nuevasVidas);
      setAciertos(nuevosAciertos);

      const motivo =
        nuevasVidas <= 0
          ? "sin-vidas"
          : index + 1 >= total
            ? "completada"
            : null;

      if (motivo) {
        setFin(motivo);
        if (!savedRef.current) {
          savedRef.current = true;
          startTransition(async () => {
            const r = await guardarRecordJuego({
              asignaturaId,
              modalidad,
              vidas: vidasIniciales,
              aciertos: nuevosAciertos,
            });
            setResultado(r);
          });
        }
      } else {
        setIndex(index + 1);
        setSeleccion(null);
      }
    }, REVEAL_MS);

    return () => clearTimeout(timer);
  }, [
    seleccion,
    fin,
    correcta,
    vidas,
    aciertos,
    index,
    total,
    asignaturaId,
    modalidad,
    vidasIniciales,
    startTransition,
  ]);

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

  const revealed = seleccion !== null;

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

      <section className="mt-6 rounded-xl border border-border bg-background p-5 shadow-sm">
        <h2 className="text-lg font-semibold leading-relaxed">{pregunta.enunciado}</h2>

        <div className="mt-6 space-y-3">
          {opciones.map((opcion) => {
            const isSelected = seleccion === opcion.key;
            const esCorrecta = revealed && correcta === opcion.key;
            const esMarcadaIncorrecta =
              revealed && isSelected && correcta !== opcion.key;
            const esAtenuada = revealed && !esCorrecta && !esMarcadaIncorrecta;
            return (
              <button
                key={opcion.key}
                type="button"
                onClick={() => {
                  if (!revealed) setSeleccion(opcion.key);
                }}
                disabled={revealed}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  esCorrecta && "border-success bg-primary-soft text-success",
                  esMarcadaIncorrecta && "border-danger bg-danger/10 text-danger",
                  esAtenuada && "border-border opacity-60",
                  !revealed && "border-border bg-background hover:bg-primary-soft",
                  revealed && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                    esCorrecta
                      ? "border-success bg-success text-white"
                      : esMarcadaIncorrecta
                        ? "border-danger bg-danger text-white"
                        : "border-border text-muted",
                  )}
                >
                  {esCorrecta ? (
                    <Check className="size-4" />
                  ) : esMarcadaIncorrecta ? (
                    <X className="size-4" />
                  ) : (
                    opcion.label
                  )}
                </span>
                <span className="flex-1">{pregunta[`opcion_${opcion.key}`]}</span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="mt-4 text-center text-xs text-muted">
        Acierta para seguir. Si fallas, pierdes una vida.
      </p>
    </div>
  );
}
