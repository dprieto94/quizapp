"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { updateConfig } from "@/lib/db";
import { configSchema } from "@/lib/validation/admin";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateConfigAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sesión expirada" };

  try {
    const input = configSchema.parse({
      penalizacion: formData.get("penalizacion"),
      timer_minutos: formData.get("timer_minutos"),
      preguntas_por_test: formData.get("preguntas_por_test"),
    });
    await updateConfig(input);
    revalidatePath("/configuracion");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error inesperado",
    };
  }
}
