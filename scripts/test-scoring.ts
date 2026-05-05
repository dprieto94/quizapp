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
