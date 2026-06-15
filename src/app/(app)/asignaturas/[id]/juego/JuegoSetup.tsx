"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { JuegoModalidad } from "@/types";

type Props = {
  asignaturaId: string;
  tieneReales: boolean;
  realesCount: number;
  totalCount: number;
};

const radioCard =
  "flex cursor-pointer gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary-soft";

export function JuegoSetup({
  asignaturaId,
  tieneReales,
  realesCount,
  totalCount,
}: Props) {
  const router = useRouter();
  const [modalidad, setModalidad] = useState<JuegoModalidad>("asignatura");
  const [vidas, setVidas] = useState(3);

  function jugar() {
    const params = new URLSearchParams({ modalidad, vidas: String(vidas) });
    router.push(`/asignaturas/${asignaturaId}/juego/jugar?${params.toString()}`);
  }

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Preguntas</h2>
        <div className={cn("mt-4 grid gap-3", tieneReales && "sm:grid-cols-2")}>
          <label className={radioCard}>
            <input
              type="radio"
              name="pool"
              value="asignatura"
              checked={modalidad === "asignatura"}
              onChange={() => setModalidad("asignatura")}
            />
            <span>
              <strong>Total</strong>
              <span className="mt-1 block text-sm text-muted">
                Todas las preguntas de la asignatura ({totalCount}).
              </span>
            </span>
          </label>
          {tieneReales ? (
            <label className={radioCard}>
              <input
                type="radio"
                name="pool"
                value="reales"
                checked={modalidad === "reales"}
                onChange={() => setModalidad("reales")}
              />
              <span>
                <strong>Examen real</strong>
                <span className="mt-1 block text-sm text-muted">
                  Solo preguntas de exámenes reales ({realesCount}).
                </span>
              </span>
            </label>
          ) : null}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Vidas</h2>
        <div className="mt-4 flex gap-3">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setVidas(n)}
              aria-pressed={vidas === n}
              aria-label={`${n} ${n === 1 ? "vida" : "vidas"}`}
              className={cn(
                "flex h-12 flex-1 items-center justify-center gap-1 rounded-xl border transition-colors",
                vidas === n
                  ? "border-primary bg-primary-soft"
                  : "border-border hover:bg-primary-soft",
              )}
            >
              {Array.from({ length: n }).map((_, i) => (
                <Heart
                  key={i}
                  className="size-5 fill-current text-danger"
                  aria-hidden="true"
                />
              ))}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={jugar}
        className="w-full shadow-[0_3px_0_var(--primary-hover)] active:translate-y-0.5 active:shadow-[0_1px_0_var(--primary-hover)] sm:w-auto"
      >
        Jugar
      </Button>
    </Card>
  );
}
