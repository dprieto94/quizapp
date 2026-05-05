"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { preguntaSchema, type PreguntaFormValues } from "@/lib/validation/admin";
import type { ActionResult } from "../_actions";
import type { Asignatura, PreguntaWithContext, TemaWithAsignatura } from "@/types";

type Props = {
  asignaturas: Asignatura[];
  temas: TemaWithAsignatura[];
  pregunta?: PreguntaWithContext;
  initialAsignaturaId?: string;
  initialTemaId?: string;
  onClose: () => void;
  action: (formData: FormData) => Promise<ActionResult>;
};

type Errors = Partial<Record<keyof PreguntaFormValues, string>>;

const selectClass =
  "block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

const textareaClass =
  "block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary";

export function PreguntaForm({
  asignaturas,
  temas,
  pregunta,
  initialAsignaturaId,
  initialTemaId,
  onClose,
  action,
}: Props) {
  const router = useRouter();
  const defaultAsignaturaId =
    pregunta?.asignatura_id ?? initialAsignaturaId ?? asignaturas[0]?.id ?? "";
  const [asignaturaId, setAsignaturaId] = useState(defaultAsignaturaId);
  const temasForAsignatura = useMemo(
    () => temas.filter((tema) => tema.asignatura_id === asignaturaId),
    [asignaturaId, temas],
  );
  const [temaId, setTemaId] = useState(
    pregunta?.tema_id ?? initialTemaId ?? temasForAsignatura[0]?.id ?? "",
  );
  const [correcta, setCorrecta] = useState(pregunta?.correcta ?? "a");
  const [errors, setErrors] = useState<Errors>({});
  const [pending, startTransition] = useTransition();

  function onAsignaturaChange(nextId: string) {
    setAsignaturaId(nextId);
    setTemaId(temas.find((tema) => tema.asignatura_id === nextId)?.id ?? "");
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("tema_id", temaId);
    formData.set("correcta", correcta);

    const parsed = preguntaSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        tema_id: fieldErrors.tema_id?.[0],
        enunciado: fieldErrors.enunciado?.[0],
        opcion_a: fieldErrors.opcion_a?.[0],
        opcion_b: fieldErrors.opcion_b?.[0],
        opcion_c: fieldErrors.opcion_c?.[0],
        correcta: fieldErrors.correcta?.[0],
      });
      return;
    }

    setErrors({});
    startTransition(async () => {
      const result = await action(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(pregunta ? "Pregunta guardada" : "Pregunta creada");
      router.refresh();
      if (pregunta) {
        onClose();
        return;
      }
      form.reset();
      setCorrecta(correcta);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">
          {pregunta ? "Editar pregunta" : "Nueva pregunta"}
        </h2>
        <p className="text-sm text-muted">
          Al crear, el modal permanece abierto para alta en serie.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="pregunta-asignatura">Asignatura</Label>
          <select
            id="pregunta-asignatura"
            value={asignaturaId}
            onChange={(e) => onAsignaturaChange(e.currentTarget.value)}
            className={selectClass}
          >
            {asignaturas.map((asignatura) => (
              <option key={asignatura.id} value={asignatura.id}>
                {asignatura.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="pregunta-tema">Tema</Label>
          <select
            id="pregunta-tema"
            name="tema_id"
            value={temaId}
            onChange={(e) => setTemaId(e.currentTarget.value)}
            className={selectClass}
            required
          >
            {temasForAsignatura.map((tema) => (
              <option key={tema.id} value={tema.id}>
                {tema.orden}. {tema.nombre}
              </option>
            ))}
          </select>
          {errors.tema_id ? <p className="mt-1 text-xs text-danger">{errors.tema_id}</p> : null}
        </div>
      </div>

      <div>
        <Label htmlFor="enunciado">Enunciado</Label>
        <textarea
          id="enunciado"
          name="enunciado"
          rows={4}
          defaultValue={pregunta?.enunciado}
          className={textareaClass}
          required
        />
        {errors.enunciado ? <p className="mt-1 text-xs text-danger">{errors.enunciado}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(["a", "b", "c"] as const).map((letter) => (
          <div key={letter}>
            <Label htmlFor={`opcion_${letter}`}>Opción {letter.toUpperCase()}</Label>
            <Input
              id={`opcion_${letter}`}
              name={`opcion_${letter}`}
              defaultValue={pregunta?.[`opcion_${letter}`]}
              required
            />
            {errors[`opcion_${letter}`] ? (
              <p className="mt-1 text-xs text-danger">{errors[`opcion_${letter}`]}</p>
            ) : null}
          </div>
        ))}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-foreground mb-2">Respuesta correcta</legend>
        <div className="flex gap-2">
          {(["a", "b", "c"] as const).map((letter) => (
            <label
              key={letter}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm"
            >
              <input
                type="radio"
                name="correcta"
                value={letter}
                checked={correcta === letter}
                onChange={() => setCorrecta(letter)}
              />
              {letter.toUpperCase()}
            </label>
          ))}
        </div>
        {errors.correcta ? <p className="mt-1 text-xs text-danger">{errors.correcta}</p> : null}
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
          Cerrar
        </Button>
        <Button type="submit" loading={pending} disabled={!temaId}>
          {pregunta ? "Guardar" : "Crear"}
        </Button>
      </div>
    </form>
  );
}
