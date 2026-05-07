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
import type {
  Asignatura,
  AsignaturaWithCounts,
  Config,
  ConfigUpdate,
  CorrectaPregunta,
  CreateTestWithRespuestasInput,
  MediaPorAsignaturaItem,
  Modalidad,
  Modo,
  NewAsignatura,
  NewPregunta,
  NewTema,
  Pregunta,
  PreguntaConTema,
  PreguntaFilters,
  PreguntaWithContext,
  Tema,
  TemaWithAsignatura,
  TemaWithCounts,
  Test,
  TestDetalle,
  TestEvolucionPunto,
  TestFilters,
  TestListaItem,
  TestRespuestaDetalle,
  UpdateAsignatura,
  UpdatePregunta,
  UpdateTema,
} from "@/types";

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function listAsignaturas(): Promise<Asignatura[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("asignaturas")
    .select("id, nombre, orden")
    .order("orden", { ascending: true });

  if (error) throw new Error(`listAsignaturas: ${error.message}`);
  return data ?? [];
}

export async function listAsignaturasWithCounts(): Promise<AsignaturaWithCounts[]> {
  const supabase = getSupabaseAdmin();
  const { data: asignaturas, error: asignaturasError } = await supabase
    .from("asignaturas")
    .select("id, nombre, orden")
    .order("orden", { ascending: true });

  if (asignaturasError) {
    throw new Error(`listAsignaturasWithCounts: ${asignaturasError.message}`);
  }

  // Una query de count por asignatura (head:true → no devuelve filas, solo el total).
  // Evita el max-rows default de Supabase (1000) que recortaría los conteos cuando hay
  // muchos preguntas (>1000) en BBDD.
  const withCounts = await Promise.all(
    ((asignaturas ?? []) as Asignatura[]).map(async (asignatura) => {
      const [{ count: temasCount, error: temasError }, { count: preguntasCount, error: preguntasError }] =
        await Promise.all([
          supabase
            .from("temas")
            .select("id", { count: "exact", head: true })
            .eq("asignatura_id", asignatura.id),
          supabase
            .from("preguntas")
            .select("id, temas!inner(asignatura_id)", { count: "exact", head: true })
            .eq("temas.asignatura_id", asignatura.id),
        ]);

      if (temasError) {
        throw new Error(`listAsignaturasWithCounts/temas: ${temasError.message}`);
      }
      if (preguntasError) {
        throw new Error(`listAsignaturasWithCounts/preguntas: ${preguntasError.message}`);
      }

      return {
        ...asignatura,
        temas_count: temasCount ?? 0,
        preguntas_count: preguntasCount ?? 0,
      };
    }),
  );

  return withCounts;
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

export async function getConfig(userId: string): Promise<Config> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("config")
    .select("user_id, penalizacion, timer_minutos, preguntas_por_test")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(`getConfig: ${error.message}`);
  return data;
}

export async function updateConfig(
  userId: string,
  payload: ConfigUpdate,
): Promise<Config> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("config")
    .update(payload)
    .eq("user_id", userId)
    .select("user_id, penalizacion, timer_minutos, preguntas_por_test")
    .single();

  if (error) throw new Error(`updateConfig: ${error.message}`);
  return data;
}

async function getNextAsignaturaOrden(): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("asignaturas")
    .select("orden")
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getNextAsignaturaOrden: ${error.message}`);
  return ((data as { orden: number } | null)?.orden ?? 0) + 1;
}

async function getNextTemaOrden(asignaturaId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("temas")
    .select("orden")
    .eq("asignatura_id", asignaturaId)
    .order("orden", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getNextTemaOrden: ${error.message}`);
  return ((data as { orden: number } | null)?.orden ?? 0) + 1;
}

export async function createAsignatura(input: NewAsignatura): Promise<Asignatura> {
  const supabase = getSupabaseAdmin();
  const payload = {
    nombre: input.nombre,
    orden: input.orden ?? (await getNextAsignaturaOrden()),
  };
  const { data, error } = await supabase
    .from("asignaturas")
    .insert(payload)
    .select("id, nombre, orden")
    .single();

  if (error) throw new Error(`createAsignatura: ${error.message}`);
  return data;
}

export async function updateAsignatura(
  id: string,
  patch: UpdateAsignatura,
): Promise<Asignatura> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("asignaturas")
    .update(patch)
    .eq("id", id)
    .select("id, nombre, orden")
    .single();

  if (error) throw new Error(`updateAsignatura: ${error.message}`);
  return data;
}

export async function deleteAsignatura(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("asignaturas").delete().eq("id", id);
  if (error) throw new Error(`deleteAsignatura: ${error.message}`);
}

export async function countTemasYPreguntasByAsignatura(
  id: string,
): Promise<{ temas: number; preguntas: number }> {
  const supabase = getSupabaseAdmin();
  const [{ count: temas, error: temasError }, { count: preguntas, error: preguntasError }] =
    await Promise.all([
      supabase.from("temas").select("id", { count: "exact", head: true }).eq("asignatura_id", id),
      supabase
        .from("preguntas")
        .select("id, temas!inner(asignatura_id)", { count: "exact", head: true })
        .eq("temas.asignatura_id", id),
    ]);

  if (temasError) throw new Error(`countTemasYPreguntasByAsignatura: ${temasError.message}`);
  if (preguntasError) {
    throw new Error(`countTemasYPreguntasByAsignatura: ${preguntasError.message}`);
  }

  return { temas: temas ?? 0, preguntas: preguntas ?? 0 };
}

export async function listTemasWithAsignatura(): Promise<TemaWithAsignatura[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("temas")
    .select("id, asignatura_id, nombre, orden, asignaturas!inner(nombre)")
    .order("orden", { ascending: true })
    .order("orden", { referencedTable: "asignaturas", ascending: true });

  if (error) throw new Error(`listTemasWithAsignatura: ${error.message}`);

  return ((data ?? []) as Array<Tema & { asignaturas: { nombre: string } | Array<{ nombre: string }> }>).map(
    (tema) => {
      const asignatura = Array.isArray(tema.asignaturas) ? tema.asignaturas[0] : tema.asignaturas;
      return {
        id: tema.id,
        asignatura_id: tema.asignatura_id,
        nombre: tema.nombre,
        orden: tema.orden,
        asignatura_nombre: asignatura?.nombre ?? "Sin asignatura",
      };
    },
  );
}

export async function listTemasWithCounts(): Promise<TemaWithCounts[]> {
  const supabase = getSupabaseAdmin();
  const temas = await listTemasWithAsignatura();

  // Una query de count por tema (head:true → no devuelve filas, solo el total).
  // Evita el max-rows default de Supabase (1000) que recortaría conteos con muchas preguntas.
  const withCounts = await Promise.all(
    temas.map(async (tema) => {
      const { count, error } = await supabase
        .from("preguntas")
        .select("id", { count: "exact", head: true })
        .eq("tema_id", tema.id);
      if (error) throw new Error(`listTemasWithCounts: ${error.message}`);
      return { ...tema, preguntas_count: count ?? 0 };
    }),
  );

  return withCounts;
}

export async function createTema(input: NewTema): Promise<Tema> {
  const supabase = getSupabaseAdmin();
  const payload = {
    asignatura_id: input.asignatura_id,
    nombre: input.nombre,
    orden: input.orden ?? (await getNextTemaOrden(input.asignatura_id)),
  };
  const { data, error } = await supabase
    .from("temas")
    .insert(payload)
    .select("id, asignatura_id, nombre, orden")
    .single();

  if (error) throw new Error(`createTema: ${error.message}`);
  return data;
}

export async function updateTema(id: string, patch: UpdateTema): Promise<Tema> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("temas")
    .update(patch)
    .eq("id", id)
    .select("id, asignatura_id, nombre, orden")
    .single();

  if (error) throw new Error(`updateTema: ${error.message}`);
  return data;
}

export async function deleteTema(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("temas").delete().eq("id", id);
  if (error) throw new Error(`deleteTema: ${error.message}`);
}

export async function countPreguntasByTema(id: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("preguntas")
    .select("id", { count: "exact", head: true })
    .eq("tema_id", id);

  if (error) throw new Error(`countPreguntasByTema: ${error.message}`);
  return count ?? 0;
}

export async function listPreguntas(
  filters: PreguntaFilters = {},
): Promise<PreguntaWithContext[]> {
  const supabase = getSupabaseAdmin();
  // Paginación manual en chunks de 1000 para sortear el max-rows default de Supabase.
  // Para casos con filtros la primera página suele ser suficiente, pero el bucle se
  // mantiene por seguridad si el banco crece >1000 preguntas en una sola asignatura.
  const PAGE = 1000;
  const all: unknown[] = [];
  for (let offset = 0; ; offset += PAGE) {
    let query = supabase
      .from("preguntas")
      .select(
        "id, tema_id, enunciado, opcion_a, opcion_b, opcion_c, correcta, justificacion, fuente, created_at, temas!inner(nombre, asignatura_id, asignaturas!inner(nombre))",
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE - 1);

    if (filters.temaId) query = query.eq("tema_id", filters.temaId);
    if (filters.asignaturaId) query = query.eq("temas.asignatura_id", filters.asignaturaId);
    if (filters.q?.trim()) query = query.ilike("enunciado", `%${filters.q.trim()}%`);

    const { data, error } = await query;
    if (error) throw new Error(`listPreguntas: ${error.message}`);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < PAGE) break;
  }

  return (all as Array<
    Pregunta & {
      temas: {
        nombre: string;
        asignatura_id: string;
        asignaturas: { nombre: string } | Array<{ nombre: string }>;
      } | Array<{
        nombre: string;
        asignatura_id: string;
        asignaturas: { nombre: string } | Array<{ nombre: string }>;
      }>;
    }
  >).map((pregunta) => {
    const tema = Array.isArray(pregunta.temas) ? pregunta.temas[0] : pregunta.temas;
    const asignatura = tema
      ? Array.isArray(tema.asignaturas)
        ? tema.asignaturas[0]
        : tema.asignaturas
      : null;

    return {
      id: pregunta.id,
      tema_id: pregunta.tema_id,
      enunciado: pregunta.enunciado,
      opcion_a: pregunta.opcion_a,
      opcion_b: pregunta.opcion_b,
      opcion_c: pregunta.opcion_c,
      correcta: pregunta.correcta,
      justificacion: pregunta.justificacion,
      fuente: pregunta.fuente,
      created_at: pregunta.created_at,
      tema_nombre: tema?.nombre ?? "Sin tema",
      asignatura_id: tema?.asignatura_id ?? "",
      asignatura_nombre: asignatura?.nombre ?? "Sin asignatura",
    };
  });
}

export async function createPregunta(input: NewPregunta): Promise<Pregunta> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("preguntas")
    .insert(input)
    .select(
      "id, tema_id, enunciado, opcion_a, opcion_b, opcion_c, correcta, justificacion, fuente, created_at",
    )
    .single();

  if (error) throw new Error(`createPregunta: ${error.message}`);
  return data;
}

export async function updatePregunta(
  id: string,
  patch: UpdatePregunta,
): Promise<Pregunta> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("preguntas")
    .update(patch)
    .eq("id", id)
    .select(
      "id, tema_id, enunciado, opcion_a, opcion_b, opcion_c, correcta, justificacion, fuente, created_at",
    )
    .single();

  if (error) throw new Error(`updatePregunta: ${error.message}`);
  return data;
}

export async function deletePregunta(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("preguntas").delete().eq("id", id);
  if (error) throw new Error(`deletePregunta: ${error.message}`);
}

export async function getRandomPreguntasByTemas(
  temaIds: string[],
  n = 20,
): Promise<PreguntaConTema[]> {
  if (!temaIds.length) return [];
  const supabase = getSupabaseAdmin();

  // Paginación manual en chunks de 1000 para sortear el max-rows default de Supabase.
  // Garantiza que si los temas seleccionados suman >1000 preguntas todas entran al
  // barajado, en vez de quedar recortadas silenciosamente.
  const PAGE = 1000;
  const allRaw: unknown[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from("preguntas")
      .select(
        "id, tema_id, enunciado, opcion_a, opcion_b, opcion_c, correcta, justificacion, fuente, created_at, temas!inner(nombre)",
      )
      .in("tema_id", temaIds)
      .range(offset, offset + PAGE - 1);
    if (error) throw new Error(`getRandomPreguntasByTemas: ${error.message}`);
    if (!data?.length) break;
    allRaw.push(...data);
    if (data.length < PAGE) break;
  }

  const flat = (allRaw as Array<
    Pregunta & { temas: { nombre: string } | Array<{ nombre: string }> }
  >).map((row) => {
    const tema = Array.isArray(row.temas) ? row.temas[0] : row.temas;
    return {
      id: row.id,
      tema_id: row.tema_id,
      enunciado: row.enunciado,
      opcion_a: row.opcion_a,
      opcion_b: row.opcion_b,
      opcion_c: row.opcion_c,
      correcta: row.correcta,
      justificacion: row.justificacion,
      fuente: row.fuente,
      created_at: row.created_at,
      tema_nombre: tema?.nombre ?? "Sin tema",
    };
  });

  return shuffled(flat).slice(0, n);
}

export async function getRandomPreguntasByAsignatura(
  asignaturaId: string,
  n = 20,
): Promise<PreguntaConTema[]> {
  const supabase = getSupabaseAdmin();

  // Paginación manual en chunks de 1000 para sortear el max-rows default de Supabase.
  // Si una asignatura supera 1000 preguntas, todas entran al barajado en vez de
  // quedar recortadas silenciosamente.
  const PAGE = 1000;
  const allRaw: unknown[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from("preguntas")
      .select(
        "id, tema_id, enunciado, opcion_a, opcion_b, opcion_c, correcta, justificacion, fuente, created_at, temas!inner(nombre, asignatura_id)",
      )
      .eq("temas.asignatura_id", asignaturaId)
      .range(offset, offset + PAGE - 1);
    if (error) throw new Error(`getRandomPreguntasByAsignatura: ${error.message}`);
    if (!data?.length) break;
    allRaw.push(...data);
    if (data.length < PAGE) break;
  }

  const flat = (allRaw as Array<
    Pregunta & {
      temas:
        | { nombre: string; asignatura_id: string }
        | Array<{ nombre: string; asignatura_id: string }>;
    }
  >).map((row) => {
    const tema = Array.isArray(row.temas) ? row.temas[0] : row.temas;
    return {
      id: row.id,
      tema_id: row.tema_id,
      enunciado: row.enunciado,
      opcion_a: row.opcion_a,
      opcion_b: row.opcion_b,
      opcion_c: row.opcion_c,
      correcta: row.correcta,
      justificacion: row.justificacion,
      fuente: row.fuente,
      created_at: row.created_at,
      tema_nombre: tema?.nombre ?? "Sin tema",
    };
  });

  return shuffled(flat).slice(0, n);
}

export async function getCorrectasByPreguntaIds(
  ids: string[],
): Promise<CorrectaPregunta[]> {
  if (!ids.length) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("preguntas")
    .select("id, tema_id, correcta, temas!inner(asignatura_id)")
    .in("id", ids);

  if (error) throw new Error(`getCorrectasByPreguntaIds: ${error.message}`);

  return ((data ?? []) as Array<{
    id: string;
    tema_id: string;
    correcta: CorrectaPregunta["correcta"];
    temas: { asignatura_id: string } | Array<{ asignatura_id: string }>;
  }>).map((row) => {
    const tema = Array.isArray(row.temas) ? row.temas[0] : row.temas;
    return {
      id: row.id,
      tema_id: row.tema_id,
      correcta: row.correcta,
      asignatura_id: tema?.asignatura_id ?? "",
    };
  });
}

export async function createTestWithRespuestas(
  payload: CreateTestWithRespuestasInput,
): Promise<{ id: string }> {
  const supabase = getSupabaseAdmin();
  const { respuestas, tema_ids, ...testRow } = payload;

  const { data: test, error: testError } = await supabase
    .from("tests")
    .insert(testRow)
    .select("id")
    .single();

  if (testError) {
    throw new Error(`createTestWithRespuestas/insert tests: ${testError.message}`);
  }

  if (tema_ids.length > 0) {
    const temaRows = tema_ids.map((tema_id) => ({ test_id: test.id, tema_id }));
    const { error: temasError } = await supabase.from("test_temas").insert(temaRows);
    if (temasError) {
      await supabase.from("tests").delete().eq("id", test.id);
      throw new Error(
        `createTestWithRespuestas/insert test_temas: ${temasError.message}`,
      );
    }
  }

  const respuestaRows = respuestas.map((respuesta) => ({
    ...respuesta,
    test_id: test.id,
  }));
  const { error: respuestasError } = await supabase
    .from("test_respuestas")
    .insert(respuestaRows);

  if (respuestasError) {
    await supabase.from("tests").delete().eq("id", test.id);
    throw new Error(
      `createTestWithRespuestas/insert respuestas: ${respuestasError.message}`,
    );
  }

  return { id: test.id };
}

export async function getTestWithRespuestas(
  testId: string,
): Promise<TestDetalle | null> {
  const supabase = getSupabaseAdmin();
  const { data: test, error: testError } = await supabase
    .from("tests")
    .select(
      "id, fecha, modo, modalidad, asignatura_id, user_id, preguntas_por_test, penalizacion, timer_minutos, aciertos, fallos, blancos, nota, asignaturas!inner(nombre)",
    )
    .eq("id", testId)
    .maybeSingle();

  if (testError) throw new Error(`getTestWithRespuestas/test: ${testError.message}`);
  if (!test) return null;

  const [
    { data: temasRaw, error: temasError },
    { data: respuestas, error: respuestasError },
  ] = await Promise.all([
    supabase
      .from("test_temas")
      .select("temas!inner(id, nombre, orden)")
      .eq("test_id", testId),
    supabase
      .from("test_respuestas")
      .select(
        "id, test_id, pregunta_id, opcion_marcada, fue_dudosa, orden, preguntas!inner(id, tema_id, enunciado, opcion_a, opcion_b, opcion_c, correcta, justificacion, fuente, created_at, temas!inner(nombre))",
      )
      .eq("test_id", testId)
      .order("orden", { ascending: true }),
  ]);

  if (temasError) throw new Error(`getTestWithRespuestas/temas: ${temasError.message}`);
  if (respuestasError) {
    throw new Error(`getTestWithRespuestas/respuestas: ${respuestasError.message}`);
  }

  const testRow = test as Test & {
    asignaturas: { nombre: string } | Array<{ nombre: string }>;
  };
  const asignatura = Array.isArray(testRow.asignaturas)
    ? testRow.asignaturas[0]
    : testRow.asignaturas;

  const temas = ((temasRaw ?? []) as Array<{
    temas:
      | { id: string; nombre: string; orden: number }
      | Array<{ id: string; nombre: string; orden: number }>;
  }>)
    .map((row) => (Array.isArray(row.temas) ? row.temas[0] : row.temas))
    .filter((t): t is { id: string; nombre: string; orden: number } => Boolean(t))
    .sort((a, b) => a.orden - b.orden);

  return {
    id: testRow.id,
    fecha: testRow.fecha,
    modo: testRow.modo,
    modalidad: testRow.modalidad,
    asignatura_id: testRow.asignatura_id,
    user_id: testRow.user_id,
    preguntas_por_test: testRow.preguntas_por_test,
    penalizacion: testRow.penalizacion,
    timer_minutos: testRow.timer_minutos,
    aciertos: testRow.aciertos,
    fallos: testRow.fallos,
    blancos: testRow.blancos,
    nota: testRow.nota,
    asignatura_nombre: asignatura?.nombre ?? "Sin asignatura",
    temas,
    respuestas: ((respuestas ?? []) as Array<
      Omit<TestRespuestaDetalle, "pregunta"> & {
        preguntas:
          | (Pregunta & { temas: { nombre: string } | Array<{ nombre: string }> })
          | Array<
              Pregunta & { temas: { nombre: string } | Array<{ nombre: string }> }
            >;
      }
    >).map((respuesta) => {
      const preguntaRaw = Array.isArray(respuesta.preguntas)
        ? respuesta.preguntas[0]
        : respuesta.preguntas;
      const tema = Array.isArray(preguntaRaw.temas)
        ? preguntaRaw.temas[0]
        : preguntaRaw.temas;
      const pregunta: PreguntaConTema = {
        id: preguntaRaw.id,
        tema_id: preguntaRaw.tema_id,
        enunciado: preguntaRaw.enunciado,
        opcion_a: preguntaRaw.opcion_a,
        opcion_b: preguntaRaw.opcion_b,
        opcion_c: preguntaRaw.opcion_c,
        correcta: preguntaRaw.correcta,
        justificacion: preguntaRaw.justificacion,
        fuente: preguntaRaw.fuente,
        created_at: preguntaRaw.created_at,
        tema_nombre: tema?.nombre ?? "Sin tema",
      };
      return {
        id: respuesta.id,
        test_id: respuesta.test_id,
        pregunta_id: respuesta.pregunta_id,
        opcion_marcada: respuesta.opcion_marcada,
        fue_dudosa: respuesta.fue_dudosa,
        orden: respuesta.orden,
        pregunta,
      };
    }),
  };
}

export async function listTests(
  filters: TestFilters,
  userId: string,
): Promise<TestListaItem[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("tests")
    .select(
      "id, fecha, modo, modalidad, asignatura_id, preguntas_por_test, aciertos, fallos, blancos, nota, asignaturas!inner(nombre, orden), test_temas(temas!inner(id, nombre, orden))",
    )
    .eq("user_id", userId)
    .order("fecha", { ascending: false });

  if (filters.asignaturaId) query = query.eq("asignatura_id", filters.asignaturaId);
  if (filters.modo) query = query.eq("modo", filters.modo);
  if (filters.desde) query = query.gte("fecha", `${filters.desde}T00:00:00`);
  if (filters.hasta) query = query.lte("fecha", `${filters.hasta}T23:59:59`);

  const { data, error } = await query;
  if (error) throw new Error(`listTests: ${error.message}`);

  return ((data ?? []) as Array<{
    id: string;
    fecha: string;
    modo: Modo;
    modalidad: Modalidad;
    asignatura_id: string;
    preguntas_por_test: number;
    aciertos: number;
    fallos: number;
    blancos: number;
    nota: number | null;
    asignaturas:
      | { nombre: string; orden: number }
      | Array<{ nombre: string; orden: number }>;
    test_temas: Array<{
      temas:
        | { id: string; nombre: string; orden: number }
        | Array<{ id: string; nombre: string; orden: number }>;
    }>;
  }>).map((row) => {
    const asignatura = Array.isArray(row.asignaturas)
      ? row.asignaturas[0]
      : row.asignaturas;
    const temas = (row.test_temas ?? [])
      .map((tt) => (Array.isArray(tt.temas) ? tt.temas[0] : tt.temas))
      .filter((t): t is { id: string; nombre: string; orden: number } => Boolean(t))
      .sort((a, b) => a.orden - b.orden);

    return {
      id: row.id,
      fecha: row.fecha,
      modo: row.modo,
      modalidad: row.modalidad,
      asignatura_id: row.asignatura_id,
      asignatura_nombre: asignatura?.nombre ?? "Sin asignatura",
      asignatura_orden: asignatura?.orden ?? 0,
      temas,
      preguntas_por_test: row.preguntas_por_test,
      aciertos: row.aciertos,
      fallos: row.fallos,
      blancos: row.blancos,
      nota: row.nota,
    };
  });
}

export async function getMediaPorAsignaturaExamen(
  userId: string,
): Promise<MediaPorAsignaturaItem[]> {
  const supabase = getSupabaseAdmin();
  const [{ data: asignaturas, error: aErr }, { data: tests, error: tErr }] =
    await Promise.all([
      supabase.from("asignaturas").select("id, nombre, orden").order("orden"),
      supabase
        .from("tests")
        .select("asignatura_id, nota")
        .eq("user_id", userId)
        .eq("modo", "examen")
        .not("nota", "is", null),
    ]);

  if (aErr) throw new Error(`getMediaPorAsignaturaExamen/asignaturas: ${aErr.message}`);
  if (tErr) throw new Error(`getMediaPorAsignaturaExamen/tests: ${tErr.message}`);

  const buckets = new Map<string, number[]>();
  for (const t of (tests ?? []) as Array<{ asignatura_id: string; nota: number }>) {
    const arr = buckets.get(t.asignatura_id) ?? [];
    arr.push(t.nota);
    buckets.set(t.asignatura_id, arr);
  }

  return ((asignaturas ?? []) as Array<{
    id: string;
    nombre: string;
    orden: number;
  }>).map((a) => {
    const notas = buckets.get(a.id) ?? [];
    const media =
      notas.length > 0
        ? Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 100) / 100
        : 0;
    return {
      asignatura_id: a.id,
      asignatura_nombre: a.nombre,
      asignatura_orden: a.orden,
      media,
      n_tests: notas.length,
    };
  });
}

export async function getEvolucionExamen(
  userId: string,
  limit = 20,
): Promise<TestEvolucionPunto[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tests")
    .select("id, fecha, nota, modalidad, asignaturas!inner(nombre)")
    .eq("user_id", userId)
    .eq("modo", "examen")
    .not("nota", "is", null)
    .order("fecha", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`getEvolucionExamen: ${error.message}`);

  return ((data ?? []) as Array<{
    id: string;
    fecha: string;
    nota: number;
    modalidad: Modalidad;
    asignaturas: { nombre: string } | Array<{ nombre: string }>;
  }>)
    .map((row) => {
      const asignatura = Array.isArray(row.asignaturas)
        ? row.asignaturas[0]
        : row.asignaturas;
      return {
        test_id: row.id,
        fecha: row.fecha,
        nota: row.nota,
        asignatura_nombre: asignatura?.nombre ?? "Sin asignatura",
        modalidad: row.modalidad,
      };
    })
    .reverse();
}
