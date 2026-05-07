"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createPregunta, deletePregunta, updatePregunta } from "@/lib/db";
import {
  preguntaSchema,
  preguntaUpdateSchema,
} from "@/lib/validation/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireSession(): Promise<ActionResult | null> {
  const session = await getSession();
  return session ? null : { ok: false, error: "Sesión expirada" };
}

function errorResult(error: unknown): ActionResult {
  if (error instanceof Error) return { ok: false, error: error.message };
  return { ok: false, error: "Error inesperado" };
}

function value(formData: FormData, key: string) {
  return formData.get(key);
}

export async function createPreguntaAction(
  formData: FormData,
): Promise<ActionResult> {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const input = preguntaSchema.parse({
      tema_id: value(formData, "tema_id"),
      enunciado: value(formData, "enunciado"),
      opcion_a: value(formData, "opcion_a"),
      opcion_b: value(formData, "opcion_b"),
      opcion_c: value(formData, "opcion_c"),
      correcta: value(formData, "correcta"),
      justificacion: value(formData, "justificacion"),
      fuente: value(formData, "fuente"),
    });
    await createPregunta(input);
    revalidatePath("/admin/preguntas");
    return { ok: true };
  } catch (error) {
    return errorResult(error);
  }
}

export async function updatePreguntaAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const patch = preguntaUpdateSchema.parse({
      tema_id: value(formData, "tema_id") ?? undefined,
      enunciado: value(formData, "enunciado") ?? undefined,
      opcion_a: value(formData, "opcion_a") ?? undefined,
      opcion_b: value(formData, "opcion_b") ?? undefined,
      opcion_c: value(formData, "opcion_c") ?? undefined,
      correcta: value(formData, "correcta") ?? undefined,
      justificacion: value(formData, "justificacion") ?? undefined,
      fuente: value(formData, "fuente") ?? undefined,
    });
    await updatePregunta(id, patch);
    revalidatePath("/admin/preguntas");
    return { ok: true };
  } catch (error) {
    return errorResult(error);
  }
}

export async function deletePreguntaAction(id: string): Promise<ActionResult> {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    await deletePregunta(id);
    revalidatePath("/admin/preguntas");
    return { ok: true };
  } catch (error) {
    return errorResult(error);
  }
}
