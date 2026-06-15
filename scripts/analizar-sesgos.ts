// QuizApp — diagnóstico de sesgos en el banco de preguntas (examen_real = false).
// Lee el export JSON y cuantifica:
//   1) Sesgo de longitud: ¿la opción correcta tiende a ser la más larga?
//   2) Muletillas "según el texto/manual…" en enunciado y justificación.
//
// Uso: tsx scripts/analizar-sesgos.ts [jsonPath]
// Es de solo lectura: no toca la BD ni el JSON.

import { readFileSync } from "node:fs";

type P = {
  id: string;
  _asignatura_orden: number;
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  correcta: "a" | "b" | "c";
  justificacion: string | null;
};

const path = process.argv[2] ?? "db/export_preguntas_no_reales.local.json";
const { preguntas } = JSON.parse(readFileSync(path, "utf8")) as { preguntas: P[] };
const N = preguntas.length;

const pct = (n: number) => `${n} (${((100 * n) / N).toFixed(1)}%)`;

// ---------- 1) Sesgo de longitud ----------
let longestUnique = 0; // correcta es estrictamente la más larga
let longestTied = 0; // correcta empata como más larga
let shortest = 0; // correcta es la más corta
let exploitable = 0; // correcta estrictamente la más larga Y >=1.5x la 2ª
let sumCorrect = 0;
let sumDistractor = 0;
const byAsig: Record<number, { n: number; longestOrTied: number }> = {};

for (const p of preguntas) {
  const len = { a: p.opcion_a.length, b: p.opcion_b.length, c: p.opcion_c.length };
  const c = p.correcta;
  const cLen = len[c];
  const others = (["a", "b", "c"] as const).filter((o) => o !== c).map((o) => len[o]);
  const max = Math.max(len.a, len.b, len.c);
  const min = Math.min(len.a, len.b, len.c);
  const secondLongest = Math.max(...others);

  const isLongest = cLen === max;
  const isUniqueLongest = isLongest && others.every((o) => o < cLen);
  if (isUniqueLongest) longestUnique++;
  else if (isLongest) longestTied++;
  if (cLen === min && others.every((o) => o > cLen)) shortest++;
  if (isUniqueLongest && secondLongest > 0 && cLen / secondLongest >= 1.5) exploitable++;

  sumCorrect += cLen;
  sumDistractor += (others[0] + others[1]) / 2;

  const a = p._asignatura_orden;
  byAsig[a] ??= { n: 0, longestOrTied: 0 };
  byAsig[a].n++;
  if (isLongest) byAsig[a].longestOrTied++;
}

console.log("═══ 1) SESGO DE LONGITUD ═══");
console.log(`Total preguntas: ${N}`);
console.log(`Correcta = la más larga (única):       ${pct(longestUnique)}`);
console.log(`Correcta = la más larga (empatada):    ${pct(longestTied)}`);
console.log(`Correcta = la más larga (única+empate): ${pct(longestUnique + longestTied)}`);
console.log(`  → esperable por azar (~más larga):    ~33.3%`);
console.log(`Correcta = la más corta:               ${pct(shortest)}`);
console.log(`Long. media opción correcta:    ${(sumCorrect / N).toFixed(1)} car.`);
console.log(`Long. media distractores:       ${(sumDistractor / N).toFixed(1)} car.`);
console.log(`Ratio correcta/distractor:      ${(sumCorrect / sumDistractor).toFixed(2)}x`);
console.log(`"Muy explotables" (correcta única más larga y ≥1.5x la 2ª): ${pct(exploitable)}`);
console.log("Por asignatura (correcta = más larga):");
for (const [a, s] of Object.entries(byAsig).sort()) {
  console.log(`  Asig ${a}: ${s.longestOrTied}/${s.n} (${((100 * s.longestOrTied) / s.n).toFixed(1)}%)`);
}

// ---------- 2) Muletillas "según el texto/manual…" ----------
const reSegun = /seg[uú]n\b/i;
const reTextoManual =
  /\b(el|del|al|lo) (texto|manual|autor|cap[ií]tulo|tema|documento|material|libro|apartado|ep[ií]grafe)\b/i;
const reTextoRecoge =
  /\bel texto (recoge|indica|se[ñn]ala|afirma|establece|expone|menciona|describe|define)\b/i;

let enunSegun = 0;
let enunTextoManual = 0;
let justSegun = 0;
let justTextoRecoge = 0;
let justTextoManual = 0;
const ejemplosEnun: string[] = [];

for (const p of preguntas) {
  const e = p.enunciado;
  const j = p.justificacion ?? "";
  if (reSegun.test(e)) {
    enunSegun++;
    if (ejemplosEnun.length < 8) ejemplosEnun.push(e.slice(0, 110));
  }
  if (reTextoManual.test(e)) enunTextoManual++;
  if (reSegun.test(j)) justSegun++;
  if (reTextoRecoge.test(j)) justTextoRecoge++;
  if (reTextoManual.test(j)) justTextoManual++;
}

console.log("\n═══ 2) MULETILLAS «según el texto / manual…» ═══");
console.log("ENUNCIADOS:");
console.log(`  contienen "según …":              ${pct(enunSegun)}`);
console.log(`  mencionan el/del texto|manual|…:  ${pct(enunTextoManual)}`);
console.log("JUSTIFICACIONES:");
console.log(`  contienen "según …":              ${pct(justSegun)}`);
console.log(`  "el texto recoge/indica/…":       ${pct(justTextoRecoge)}`);
console.log(`  mencionan el/del texto|manual|…:  ${pct(justTextoManual)}`);
console.log("\nEjemplos de enunciados con muletilla:");
for (const ex of ejemplosEnun) console.log(`  · ${ex}…`);
