/**
 * Capa de datos centralizada.
 *
 * Reglas:
 * - Las pages (Server Components / route handlers / Server Actions) NO importan
 *   `@supabase/supabase-js` directamente. Importan funciones de aquí.
 * - Cada función obtiene su cliente vía `getSupabaseAdmin()` (sin singleton).
 * - Errores: lanzar `Error("nombreFuncion: mensaje")` para localización rápida.
 * - Lecturas de 0/1 filas: `.maybeSingle()` -> devolver `null` si no hay.
 * - Lecturas de N filas: devolver `[]` si no hay.
 *
 * Política de crecimiento: solo se añaden funciones cuando una página o action
 * concreta las necesita. No se escriben "por adelantado". Si añades una nueva,
 * tipa entrada y salida desde @/types y respeta el patrón de errores.
 */
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Asignatura, Config, ConfigUpdate, Tema } from "@/types";

export async function listAsignaturas(): Promise<Asignatura[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("asignaturas")
    .select("id, nombre, orden")
    .order("orden", { ascending: true });

  if (error) throw new Error(`listAsignaturas: ${error.message}`);
  return data ?? [];
}

export async function getAsignatura(id: string): Promise<Asignatura | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("asignaturas")
    .select("id, nombre, orden")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getAsignatura: ${error.message}`);
  return data;
}

export async function listTemasByAsignatura(
  asignaturaId: string,
): Promise<Tema[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("temas")
    .select("id, asignatura_id, nombre, orden")
    .eq("asignatura_id", asignaturaId)
    .order("orden", { ascending: true });

  if (error) throw new Error(`listTemasByAsignatura: ${error.message}`);
  return data ?? [];
}

export async function getTema(id: string): Promise<Tema | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("temas")
    .select("id, asignatura_id, nombre, orden")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getTema: ${error.message}`);
  return data;
}

export async function getConfig(): Promise<Config> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("config")
    .select("id, penalizacion, timer_minutos")
    .eq("id", 1)
    .single();

  if (error) throw new Error(`getConfig: ${error.message}`);
  return data;
}

export async function updateConfig(payload: ConfigUpdate): Promise<Config> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("config")
    .update(payload)
    .eq("id", 1)
    .select("id, penalizacion, timer_minutos")
    .single();

  if (error) throw new Error(`updateConfig: ${error.message}`);
  return data;
}
