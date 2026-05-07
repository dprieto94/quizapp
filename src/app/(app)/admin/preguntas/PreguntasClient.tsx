"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import type {
  Asignatura,
  PreguntaWithContext,
  Tema,
  TemaWithAsignatura,
} from "@/types";
import {
  createPreguntaAction,
  deletePreguntaAction,
  updatePreguntaAction,
} from "../_actions";
import { PreguntaForm } from "./PreguntaForm";

type Props = {
  asignaturas: Asignatura[];
  allTemas: TemaWithAsignatura[];
  filterTemas: Tema[];
  preguntas: PreguntaWithContext[];
  filters: { asignaturaId: string; temaId: string; q: string };
};

const selectClass =
  "block h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

export function PreguntasClient({
  asignaturas,
  allTemas,
  filterTemas,
  preguntas,
  filters,
}: Props) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<PreguntaWithContext | null>(null);
  const [deleting, setDeleting] = useState<PreguntaWithContext | null>(null);

  function navigate(next: { asignaturaId?: string; temaId?: string; q?: string }) {
    const params = new URLSearchParams();
    const asignaturaId = next.asignaturaId ?? filters.asignaturaId;
    const temaId = next.temaId ?? filters.temaId;
    const q = next.q ?? filters.q;
    if (asignaturaId) params.set("asignaturaId", asignaturaId);
    if (temaId) params.set("temaId", temaId);
    if (q.trim()) params.set("q", q.trim());
    router.replace(`/admin/preguntas${params.size ? `?${params.toString()}` : ""}`);
  }

  function submitSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    navigate({ q: String(formData.get("q") ?? "") });
  }

  async function confirmDelete(pregunta: PreguntaWithContext) {
    const result = await deletePreguntaAction(pregunta.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Pregunta eliminada");
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Preguntas</h2>
          <p className="text-sm text-muted">Crea, edita y filtra el banco de preguntas.</p>
        </div>
        <Button type="button" onClick={() => setCreating(true)} disabled={!allTemas.length}>
          Nueva pregunta
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_2fr]">
        <div>
          <Label htmlFor="filter-asignatura">Asignatura</Label>
          <select
            id="filter-asignatura"
            value={filters.asignaturaId}
            onChange={(e) => navigate({ asignaturaId: e.currentTarget.value, temaId: "" })}
            className={selectClass}
          >
            <option value="">Todas</option>
            {asignaturas.map((asignatura) => (
              <option key={asignatura.id} value={asignatura.id}>
                {asignatura.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="filter-tema">Tema</Label>
          <select
            id="filter-tema"
            value={filters.temaId}
            onChange={(e) => navigate({ temaId: e.currentTarget.value })}
            className={selectClass}
            disabled={!filters.asignaturaId}
          >
            <option value="">Todos</option>
            {filterTemas.map((tema) => (
              <option key={tema.id} value={tema.id}>
                {tema.orden}. {tema.nombre}
              </option>
            ))}
          </select>
        </div>
        <form onSubmit={submitSearch}>
          <Label htmlFor="filter-q">Buscar enunciado</Label>
          <div className="flex gap-2">
            <Input id="filter-q" name="q" defaultValue={filters.q} placeholder="Texto..." />
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-border">
              <th className="py-2 pr-3 font-medium">Enunciado</th>
              <th className="py-2 pr-3 font-medium">Tema</th>
              <th className="py-2 pr-3 font-medium">Asignatura</th>
              <th className="py-2 pr-3 font-medium">Correcta</th>
              <th className="py-2 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {preguntas.length ? (
              preguntas.map((pregunta) => (
                <tr key={pregunta.id} className="border-b border-border last:border-0">
                  <td className="max-w-sm py-3 pr-3">
                    <span title={pregunta.enunciado} className="line-clamp-2">
                      {pregunta.enunciado}
                    </span>
                  </td>
                  <td className="py-3 pr-3">{pregunta.tema_nombre}</td>
                  <td className="py-3 pr-3">{pregunta.asignatura_nombre}</td>
                  <td className="py-3 pr-3">
                    <Badge variant="success">{pregunta.correcta.toUpperCase()}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditing(pregunta)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleting(pregunta)}
                      >
                        Borrar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted">
                  No hay preguntas con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        aria-label="Nueva pregunta"
        className="max-w-3xl"
      >
        <PreguntaForm
          asignaturas={asignaturas}
          temas={allTemas}
          initialAsignaturaId={filters.asignaturaId}
          initialTemaId={filters.temaId}
          onClose={() => setCreating(false)}
          action={createPreguntaAction}
        />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        aria-label="Editar pregunta"
        className="max-w-3xl"
      >
        {editing ? (
          <PreguntaForm
            asignaturas={asignaturas}
            temas={allTemas}
            pregunta={editing}
            onClose={() => setEditing(null)}
            action={(formData) => updatePreguntaAction(editing.id, formData)}
          />
        ) : null}
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Eliminar pregunta"
        description={<p>La pregunta desaparecerá del banco. Esta acción no se puede deshacer.</p>}
        onConfirm={async () => {
          if (!deleting) return;
          await confirmDelete(deleting);
        }}
      />
    </Card>
  );
}
