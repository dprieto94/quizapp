import assert from "node:assert/strict";
import { test } from "node:test";
import { calcularNota } from "../src/lib/scoring";

test("todo correcto -> 10.00", () => {
  assert.equal(calcularNota(20, 0, 0.5), 10);
});

test("todo fallado se trunca a 0", () => {
  assert.equal(calcularNota(0, 20, 0.5), 0);
});

test("todo en blanco -> 0.00", () => {
  assert.equal(calcularNota(0, 0, 0.5), 0);
});

test("P=0 no penaliza fallos", () => {
  assert.equal(calcularNota(18, 2, 0), 9);
});

test("P=1 penaliza al máximo", () => {
  assert.equal(calcularNota(18, 2, 1), 8);
});

test("caso típico", () => {
  assert.equal(calcularNota(14, 4, 0.5), 6);
});

test("redondea a 2 decimales", () => {
  assert.equal(calcularNota(11, 3, 0.5), 4.75);
});

test("negativo extremo se trunca a 0", () => {
  assert.equal(calcularNota(5, 15, 1), 0);
});

import {
  correctaTrasShuffle,
  permutationFor,
  shufflePregunta,
} from "../src/lib/shuffle";

test("shuffle: misma entrada → misma salida", () => {
  const a = permutationFor("pid-1", "seed-A");
  const b = permutationFor("pid-1", "seed-A");
  assert.deepEqual(a, b);
});

test("shuffle: distinto seed → permutación distinta (probabilísticamente)", () => {
  const seedsDistintos = ["s1", "s2", "s3", "s4", "s5"];
  const perms = seedsDistintos.map((s) => permutationFor("pid-X", s).join(""));
  const unicos = new Set(perms);
  assert.ok(unicos.size >= 2, "esperaba variedad de permutaciones");
});

test("shuffle: testSeed null → pregunta sin cambios", () => {
  const p = {
    id: "pid",
    tema_id: "t",
    enunciado: "?",
    opcion_a: "A",
    opcion_b: "B",
    opcion_c: "C",
    correcta: "a" as const,
    justificacion: null,
    fuente: null,
    created_at: null,
  };
  const r = shufflePregunta(p, null);
  assert.equal(r.opcion_a, "A");
  assert.equal(r.opcion_b, "B");
  assert.equal(r.opcion_c, "C");
  assert.equal(r.correcta, "a");
});

test("shuffle: invariante — el texto detrás de la nueva correcta es siempre el original correcto", () => {
  const p = {
    id: "pid",
    tema_id: "t",
    enunciado: "?",
    opcion_a: "A",
    opcion_b: "B",
    opcion_c: "C",
    correcta: "a" as const,
    justificacion: null,
    fuente: null,
    created_at: null,
  };
  for (let i = 0; i < 50; i++) {
    const seed = `seed-${i}`;
    const r = shufflePregunta(p, seed);
    const textoCorrecto = { a: r.opcion_a, b: r.opcion_b, c: r.opcion_c }[r.correcta];
    assert.equal(textoCorrecto, "A");
  }
});

test("shuffle: idempotencia con seed → reproducible", () => {
  const p = {
    id: "pid-42",
    tema_id: "t",
    enunciado: "?",
    opcion_a: "X",
    opcion_b: "Y",
    opcion_c: "Z",
    correcta: "b" as const,
    justificacion: null,
    fuente: null,
    created_at: null,
  };
  const r1 = shufflePregunta(p, "seed-99");
  const r2 = shufflePregunta(p, "seed-99");
  assert.equal(r1.opcion_a, r2.opcion_a);
  assert.equal(r1.opcion_b, r2.opcion_b);
  assert.equal(r1.opcion_c, r2.opcion_c);
  assert.equal(r1.correcta, r2.correcta);
});

test("correctaTrasShuffle: coherente con shufflePregunta", () => {
  const pregunta = {
    id: "pid-7",
    tema_id: "t",
    enunciado: "?",
    opcion_a: "A",
    opcion_b: "B",
    opcion_c: "C",
    correcta: "c" as const,
    justificacion: null,
    fuente: null,
    created_at: null,
  };
  for (let i = 0; i < 20; i++) {
    const seed = `seed-${i}`;
    const r = shufflePregunta(pregunta, seed);
    const fromHelper = correctaTrasShuffle(pregunta.id, pregunta.correcta, seed);
    assert.equal(fromHelper, r.correcta);
  }
});
