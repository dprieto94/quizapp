"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { Config } from "@/types";
import { updateConfigAction } from "./actions";

type Props = { config: Config };

export function ConfigForm({ config }: Props) {
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateConfigAction(formData);
      if (result.ok) toast.success("Configuración guardada");
      else toast.error(result.error);
    });
  }

  return (
    <Card>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="penalizacion">Penalización por fallo</Label>
            <Input
              id="penalizacion"
              name="penalizacion"
              type="number"
              step="0.05"
              min={0}
              max={1}
              defaultValue={config.penalizacion}
              required
            />
            <p className="mt-1 text-xs text-muted">Entre 0.00 y 1.00.</p>
          </div>
          <div>
            <Label htmlFor="timer_minutos">Duración del timer (min)</Label>
            <Input
              id="timer_minutos"
              name="timer_minutos"
              type="number"
              min={5}
              max={180}
              defaultValue={config.timer_minutos}
              required
            />
            <p className="mt-1 text-xs text-muted">Solo aplica al modo Examen.</p>
          </div>
          <div>
            <Label htmlFor="preguntas_por_test">Preguntas por test</Label>
            <Input
              id="preguntas_por_test"
              name="preguntas_por_test"
              type="number"
              min={20}
              max={30}
              defaultValue={config.preguntas_por_test}
              required
            />
            <p className="mt-1 text-xs text-muted">Entre 20 y 30.</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={pending}>
            Guardar
          </Button>
        </div>
      </form>
    </Card>
  );
}
