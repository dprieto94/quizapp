// QuizApp — export preguntas con examen_real = false → JSON (DATOS REALES — NO COMMITEAR el output)
//
// Uso:
//   npm run export:preguntas            # → db/export_preguntas_no_reales.local.json
//   tsx --env-file=.env.local scripts/export-preguntas.ts [outputPath]
//
// Pagina de 1000 en 1000 (límite max-rows de PostgREST) y ordena por
// asignatura/tema/enunciado para que el fichero sea fácil de revisar.
// Conserva el `id` de cada pregunta para poder generar UPDATEs después.

import { createClient } from "@supabase/supabase-js";
import { writeFileSync } from "node:fs";

const PAGE = 1000;
const OUTPUT_PATH = process.argv[2] ?? "db/export_preguntas_no_reales.local.json";

type Row = {
  id: string;
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  correcta: "a" | "b" | "c";
  justificacion: string | null;
  fuente: string | null;
  examen_real: boolean | null;
  temas:
    | { nombre: string; orden: number; asignaturas: { nombre: string; orden: number } | { nombre: string; orden: number }[] }
    | { nombre: string; orden: number; asignaturas: { nombre: string; orden: number } | { nombre: string; orden: number }[] }[];
};

function one<T>(rel: T | T[]): T {
  return Array.isArray(rel) ? rel[0] : rel;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is required");
    process.exit(1);
  }
  if (!secretKey) {
    console.error("SUPABASE_SECRET_KEY is required");
    process.exit(1);
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const raw: Row[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase
      .from("preguntas")
      .select(
        "id, enunciado, opcion_a, opcion_b, opcion_c, correcta, justificacion, fuente, examen_real, temas!inner(nombre, orden, asignaturas!inner(nombre, orden))",
      )
      .eq("examen_real", false)
      .order("id")
      .range(offset, offset + PAGE - 1);

    if (error) {
      console.error("export-preguntas:", error.message);
      process.exit(1);
    }
    if (!data?.length) break;
    raw.push(...(data as unknown as Row[]));
    if (data.length < PAGE) break;
  }

  const preguntas = raw
    .map((row) => {
      const tema = one(row.temas);
      const asig = one(tema.asignaturas);
      return {
        id: row.id,
        _asignatura: `${asig.orden} — ${asig.nombre}`,
        _tema: `${tema.orden} — ${tema.nombre}`,
        _asignatura_orden: asig.orden,
        _tema_orden: tema.orden,
        enunciado: row.enunciado,
        opcion_a: row.opcion_a,
        opcion_b: row.opcion_b,
        opcion_c: row.opcion_c,
        correcta: row.correcta,
        justificacion: row.justificacion,
        fuente: row.fuente,
      };
    })
    .sort(
      (a, b) =>
        a._asignatura_orden - b._asignatura_orden ||
        a._tema_orden - b._tema_orden ||
        a.enunciado.localeCompare(b.enunciado, "es"),
    );

  const porAsignatura: Record<string, number> = {};
  for (const p of preguntas) {
    porAsignatura[p._asignatura] = (porAsignatura[p._asignatura] ?? 0) + 1;
  }

  const output = {
    _meta: {
      filtro: "examen_real = false",
      total: preguntas.length,
      generado: new Date().toISOString(),
      por_asignatura: porAsignatura,
    },
    preguntas,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));

  console.log("✓ Export completado");
  console.log(`  Fichero: ${OUTPUT_PATH}`);
  console.log(`  Total preguntas (examen_real = false): ${preguntas.length}`);
  console.log("  Desglose por asignatura:");
  for (const [asig, count] of Object.entries(porAsignatura)) {
    console.log(`    ${asig}: ${count}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
