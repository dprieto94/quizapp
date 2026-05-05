"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import type { Asignatura, TemaWithCounts } from "@/types";
import {
  createTemaAction,
  deleteTemaAction,
  updateTemaAction,
} from "../_actions";

type Props = {
  asignaturas: Asignatura[];
  temas: TemaWithCounts[];
  selectedAsignaturaId: string;
};

const selectClass =
  "block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export function TemasClient({ asignaturas, temas, selectedAsignaturaId }: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<TemaWithCounts | null>(null);
  const [pending, startTransition] = useTransition();

  function setAsignaturaFilter(id: string) {
    const params = new URLSearchParams();
    if (id) params.set("asignaturaId", id);
    router.replace(`/admin/temas${params.size ? `?${params.toString()}` : ""}`);
  }

  function submitCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await createTemaAction(new FormData(form));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Tema creado");
      form.reset();
      setCreating(false);
    });
  }

  function updateField(
    id: string,
    key: "asignatura_id" | "nombre" | "orden",
    value: string,
  ) {
    const formData = new FormData();
    formData.set(key, value);
    startTransition(async () => {
      const result = await updateTemaAction(id, formData);
      if (result.ok) toast.success("Tema guardado");
      else toast.error(result.error);
    });
  }

  async function confirmDelete(tema: TemaWithCounts) {
    const result = await deleteTemaAction(tema.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Tema eliminado");
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Temas</h2>
          <p className="text-sm text-muted">Gestiona temas y su asignatura.</p>
        </div>
        <Button type="button" onClick={() => setCreating(true)}>
          Nuevo tema
        </Button>
      </div>

      <div className="mt-6 max-w-sm">
        <Label htmlFor="filter-asignatura">Filtrar por asignatura</Label>
        <select
          id="filter-asignatura"
          value={selectedAsignaturaId}
          onChange={(e) => setAsignaturaFilter(e.currentTarget.value)}
          className={selectClass}
        >
          <option value="">Todas</option>
          {asignaturas.map((asignatura) => (
            <option key={asignatura.id} value={asignatura.id}>
              {asignatura.orden}. {asignatura.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-border">
              <th className="py-2 pr-3 font-medium">Orden</th>
              <th className="py-2 pr-3 font-medium">Nombre</th>
              <th className="py-2 pr-3 font-medium">Asignatura</th>
              <th className="py-2 pr-3 font-medium">Preguntas</th>
              <th className="py-2 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {temas.map((tema) => (
              <tr key={tema.id} className="border-b border-border last:border-0">
                <td className="py-3 pr-3">
                  <Input
                    defaultValue={tema.orden}
                    type="number"
                    min={1}
                    className="w-24"
                    disabled={pending}
                    onBlur={(e) => updateField(tema.id, "orden", e.currentTarget.value)}
                  />
                </td>
                <td className="py-3 pr-3">
                  <Input
                    defaultValue={tema.nombre}
                    disabled={pending}
                    onBlur={(e) => updateField(tema.id, "nombre", e.currentTarget.value)}
                  />
                </td>
                <td className="py-3 pr-3">
                  <select
                    defaultValue={tema.asignatura_id}
                    className={selectClass}
                    disabled={pending}
                    onChange={(e) => updateField(tema.id, "asignatura_id", e.currentTarget.value)}
                  >
                    {asignaturas.map((asignatura) => (
                      <option key={asignatura.id} value={asignatura.id}>
                        {asignatura.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 pr-3 tabular-nums">{tema.preguntas_count}</td>
                <td className="py-3 text-right">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleting(tema)}
                  >
                    Borrar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} aria-label="Nuevo tema">
        <form onSubmit={submitCreate} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Nuevo tema</h2>
            <p className="text-sm text-muted">Si dejas el orden vacío se asigna al final.</p>
          </div>
          <div>
            <Label htmlFor="tema-asignatura">Asignatura</Label>
            <select
              id="tema-asignatura"
              name="asignatura_id"
              className={selectClass}
              defaultValue={selectedAsignaturaId || asignaturas[0]?.id}
              required
            >
              {asignaturas.map((asignatura) => (
                <option key={asignatura.id} value={asignatura.id}>
                  {asignatura.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="tema-nombre">Nombre</Label>
            <Input id="tema-nombre" name="nombre" required maxLength={100} />
          </div>
          <div>
            <Label htmlFor="tema-orden">Orden</Label>
            <Input id="tema-orden" name="orden" type="number" min={1} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Crear
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Eliminar tema"
        description={
          deleting ? (
            <p>
              Se eliminarán {deleting.preguntas_count} preguntas asociadas. Esta acción no se puede deshacer.
            </p>
          ) : null
        }
        onConfirm={async () => {
          if (deleting) await confirmDelete(deleting);
        }}
      />
    </Card>
  );
}
