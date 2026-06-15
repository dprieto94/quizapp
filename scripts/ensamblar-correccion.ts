// QuizApp — ensambla y VALIDA la salida del workflow de corrección (DATOS REALES — NO COMMITEAR).
// Para cada lote compara out vs in y exige invariantes; genera UPDATEs por asignatura
// y una proyección para re-pasar analizar-sesgos.ts. Solo lectura sobre BD.
//
// Uso: tsx scripts/ensamblar-correccion.ts

import { existsSync, readFileSync, writeFileSync } from "node:fs";

const DIR = "db/_correccion";
const index = JSON.parse(readFileSync(`${DIR}/_index.local.json`, "utf8")) as Array<{
  in_path: string;
  out_path: string;
  asignatura_orden: number;
  tema_orden: number;
  tema_nombre: string;
  n: number;
}>;

type In = {
  id: string;
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  correcta: "a" | "b" | "c";
  justificacion: string | null;
  fuente: string | null;
};
type Out = Omit<In, "fuente">;

const sqlEsc = (v: string | null) =>
  v === null || v === undefined ? "null" : "'" + v.replace(/'/g, "''") + "'";

const proyeccion: Array<Record<string, unknown>> = [];
const problemas: string[] = [];
const sqlPorAsig = new Map<number, string[]>();
let totalUpdates = 0;
let lotesFallidos = 0;

for (const lote of index) {
  if (!existsSync(lote.out_path)) {
    problemas.push(`FALTA salida: ${lote.out_path} (asig${lote.asignatura_orden} tema${lote.tema_orden})`);
    lotesFallidos++;
    continue;
  }
  const inData = (JSON.parse(readFileSync(lote.in_path, "utf8")) as { preguntas: In[] }).preguntas;
  const inById = new Map(inData.map((p) => [p.id, p]));

  let outData: Out[];
  try {
    outData = JSON.parse(readFileSync(lote.out_path, "utf8")) as Out[];
    if (!Array.isArray(outData)) throw new Error("la salida no es un array");
  } catch (e) {
    problemas.push(`JSON inválido en ${lote.out_path}: ${(e as Error).message}`);
    lotesFallidos++;
    continue;
  }

  const seen = new Set<string>();
  for (const o of outData) {
    const orig = inById.get(o.id);
    const tag = `asig${lote.asignatura_orden} tema${lote.tema_orden} id=${o.id}`;
    if (!orig) {
      problemas.push(`${tag}: id no existe en la entrada`);
      continue;
    }
    seen.add(o.id);
    // Invariantes que NO pueden romperse
    if (o.correcta !== orig.correcta) {
      problemas.push(`${tag}: cambió la respuesta correcta (${orig.correcta}→${o.correcta}) — se OMITE`);
      continue;
    }
    const opts = [o.opcion_a, o.opcion_b, o.opcion_c];
    if (opts.some((x) => typeof x !== "string" || x.trim().length === 0)) {
      problemas.push(`${tag}: opción vacía — se OMITE`);
      continue;
    }
    if (!o.enunciado?.trim() || !o.justificacion?.trim()) {
      problemas.push(`${tag}: enunciado/justificación vacíos — se OMITE`);
      continue;
    }
    // Aviso (no bloqueante): la correcta sigue siendo la más larga con holgura
    const len = { a: o.opcion_a.length, b: o.opcion_b.length, c: o.opcion_c.length };
    const others = (["a", "b", "c"] as const).filter((k) => k !== o.correcta).map((k) => len[k]);
    if (len[o.correcta] > Math.max(...others) * 1.4) {
      problemas.push(`${tag}: AVISO la correcta sigue siendo bastante más larga`);
    }

    if (!sqlPorAsig.has(lote.asignatura_orden)) sqlPorAsig.set(lote.asignatura_orden, []);
    sqlPorAsig.get(lote.asignatura_orden)!.push(
      `update preguntas set\n` +
        `  enunciado = ${sqlEsc(o.enunciado)},\n` +
        `  opcion_a = ${sqlEsc(o.opcion_a)},\n` +
        `  opcion_b = ${sqlEsc(o.opcion_b)},\n` +
        `  opcion_c = ${sqlEsc(o.opcion_c)},\n` +
        `  justificacion = ${sqlEsc(o.justificacion)}\n` +
        `where id = ${sqlEsc(o.id)};`,
    );
    totalUpdates++;

    proyeccion.push({
      id: o.id,
      _asignatura_orden: lote.asignatura_orden,
      _tema_orden: lote.tema_orden,
      enunciado: o.enunciado,
      opcion_a: o.opcion_a,
      opcion_b: o.opcion_b,
      opcion_c: o.opcion_c,
      correcta: o.correcta,
      justificacion: o.justificacion,
    });
  }
  for (const id of inById.keys()) {
    if (!seen.has(id)) problemas.push(`asig${lote.asignatura_orden} tema${lote.tema_orden} id=${id}: NO aparece en la salida`);
  }
}

// Escribe SQL por asignatura: db/17..21
const fileForAsig = (a: number) => `db/${16 + a}_fix_preguntas_asig${a}.local.sql`;
for (const [asig, stmts] of [...sqlPorAsig.entries()].sort((x, y) => x[0] - y[0])) {
  const header =
    `-- QuizApp — corrección de preguntas Asignatura ${asig} (DATOS REALES — NO COMMITEAR)\n` +
    `-- Generado por scripts/ensamblar-correccion.ts a partir del workflow de reescritura.\n` +
    `-- Equilibra opciones (anti sesgo de longitud) y limpia muletillas. NO toca 'correcta' ni 'fuente'.\n` +
    `-- Idempotente: UPDATE por id.\n\n`;
  writeFileSync(fileForAsig(asig), header + stmts.join("\n\n") + "\n");
}

writeFileSync(`${DIR}/_proyeccion.local.json`, JSON.stringify({ preguntas: proyeccion }, null, 2));

console.log("═══ ENSAMBLADO ═══");
console.log(`Lotes: ${index.length} · fallidos: ${lotesFallidos}`);
console.log(`UPDATEs generados: ${totalUpdates}`);
console.log(`Ficheros SQL: ${[...sqlPorAsig.keys()].sort().map(fileForAsig).join(", ")}`);
console.log(`Proyección para análisis: ${DIR}/_proyeccion.local.json`);
console.log(`\nProblemas/avisos: ${problemas.length}`);
for (const p of problemas.slice(0, 40)) console.log(`  · ${p}`);
if (problemas.length > 40) console.log(`  … y ${problemas.length - 40} más`);
