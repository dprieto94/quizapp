"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import type { AsignaturaWithCounts } from "@/types";
import {
  createAsignaturaAction,
  deleteAsignaturaAction,
  updateAsignaturaAction,
} from "../_actions";

type Props = {
  asignaturas: AsignaturaWithCounts[];
};

export function AsignaturasClient({ asignaturas }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AsignaturaWithCounts | null>(null);
  const [pending, startTransition] = useTransition();

  function submitCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await createAsignaturaAction(new FormData(form));
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Asignatura creada");
      form.reset();
      setCreating(false);
    });
  }

  function updateField(id: string, key: "nombre" | "orden", value: string) {
    const formData = new FormData();
    formData.set(key, value);
    startTransition(async () => {
      const result = await updateAsignaturaAction(id, formData);
      if (result.ok) toast.success("Asignatura guardada");
      else toast.error(result.error);
    });
  }

  async function confirmDelete(asignatura: AsignaturaWithCounts) {
    const result = await deleteAsignaturaAction(asignatura.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Asignatura eliminada");
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Asignaturas</h2>
          <p className="text-sm text-muted">Renombra y ordena las asignaturas.</p>
        </div>
        <Button type="button" onClick={() => setCreating(true)}>
          Nueva asignatura
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-border">
              <th className="py-2 pr-3 font-medium">Orden</th>
              <th className="py-2 pr-3 font-medium">Nombre</th>
              <th className="py-2 pr-3 font-medium">Temas</th>
              <th className="py-2 pr-3 font-medium">Preguntas</th>
              <th className="py-2 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignaturas.map((asignatura) => (
              <tr key={asignatura.id} className="border-b border-border last:border-0">
                <td className="py-3 pr-3">
                  <Input
                    defaultValue={asignatura.orden}
                    type="number"
                    min={1}
                    className="w-24"
                    disabled={pending}
                    onBlur={(e) => updateField(asignatura.id, "orden", e.currentTarget.value)}
                  />
                </td>
                <td className="py-3 pr-3">
                  <Input
                    defaultValue={asignatura.nombre}
                    disabled={pending}
                    onBlur={(e) => updateField(asignatura.id, "nombre", e.currentTarget.value)}
                  />
                </td>
                <td className="py-3 pr-3 tabular-nums">{asignatura.temas_count}</td>
                <td className="py-3 pr-3 tabular-nums">{asignatura.preguntas_count}</td>
                <td className="py-3 text-right">
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleting(asignatura)}
                  >
                    Borrar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} aria-label="Nueva asignatura">
        <form ref={formRef} onSubmit={submitCreate} className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Nueva asignatura</h2>
            <p className="text-sm text-muted">Si dejas el orden vacío se asigna al final.</p>
          </div>
          <div>
            <Label htmlFor="asignatura-nombre">Nombre</Label>
            <Input id="asignatura-nombre" name="nombre" required maxLength={100} />
          </div>
          <div>
            <Label htmlFor="asignatura-orden">Orden</Label>
            <Input id="asignatura-orden" name="orden" type="number" min={1} />
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
        title="Eliminar asignatura"
        description={
          deleting ? (
            <p>
              Se eliminarán también {deleting.temas_count} temas y {deleting.preguntas_count} preguntas.
              Esta acción no se puede deshacer.
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
