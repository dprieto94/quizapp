/**
 * Shuffle determinista de las 3 opciones de una pregunta.
 *
 * Usa una semilla por test (`testSeed`) + el id de la pregunta para producir
 * una de las 6 permutaciones posibles de [a, b, c]. Misma entrada → misma
 * salida, lo que permite reconstruir lo que la usuaria vio en cualquier
 * momento (ej. en la pantalla de resultado).
 *
 * Motivación: el banco generado con LLM tiene sesgo posicional fuerte
 * (a~45% / b~47% / c~7%). Aplicar este shuffle en cada test serve neutraliza
 * el sesgo de cara a la usuaria sin tocar el dato en BBDD.
 */

import type { Opcion, Pregunta, PreguntaConTema, PreguntaPublica } from "@/types";

type LetterTriple = readonly [Opcion, Opcion, Opcion];

const PERMUTATIONS: readonly LetterTriple[] = [
  ["a", "b", "c"],
  ["a", "c", "b"],
  ["b", "a", "c"],
  ["b", "c", "a"],
  ["c", "a", "b"],
  ["c", "b", "a"],
];

/**
 * Hash determinista (djb2-like) de un string a un entero positivo.
 * Suficientemente uniforme para indexar 6 permutaciones; no es criptográfico.
 */
function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function permutationFor(preguntaId: string, testSeed: string): LetterTriple {
  const idx = hashString(`${preguntaId}|${testSeed}`) % PERMUTATIONS.length;
  return PERMUTATIONS[idx];
}

type PreguntaShuffleable =
  | Pregunta
  | PreguntaConTema
  | (PreguntaPublica & { correcta?: Opcion });

/**
 * Aplica el shuffle a una pregunta. Devuelve un objeto con las mismas claves
 * pero con `opcion_a/b/c` permutadas y, si la pregunta tenía `correcta`, con
 * la nueva letra correcta tras la permutación.
 *
 * Si `testSeed` es null/undefined, devuelve la pregunta sin tocar (legacy).
 */
export function shufflePregunta<T extends PreguntaShuffleable>(
  pregunta: T,
  testSeed: string | null | undefined,
): T {
  if (!testSeed) return pregunta;

  const perm = permutationFor(pregunta.id, testSeed);
  const optionsByLetter: Record<Opcion, string> = {
    a: pregunta.opcion_a,
    b: pregunta.opcion_b,
    c: pregunta.opcion_c,
  };

  const result: T = {
    ...pregunta,
    opcion_a: optionsByLetter[perm[0]],
    opcion_b: optionsByLetter[perm[1]],
    opcion_c: optionsByLetter[perm[2]],
  };

  // Si la pregunta tiene letra correcta original (Pregunta/PreguntaConTema o
  // un PreguntaPublica enriquecido), recalcular la nueva posición.
  if ("correcta" in pregunta && pregunta.correcta) {
    const correctaIdx = perm.indexOf(pregunta.correcta);
    (result as PreguntaShuffleable).correcta = (
      ["a", "b", "c"] as const
    )[correctaIdx];
  }

  return result;
}

/**
 * Devuelve la letra correcta tras aplicar la permutación, sin necesidad de
 * pasar el objeto completo de pregunta. Útil en server actions que solo
 * tienen `pregunta_id` + `correcta` (de `getCorrectasByPreguntaIds`).
 */
export function correctaTrasShuffle(
  preguntaId: string,
  originalCorrecta: Opcion,
  testSeed: string,
): Opcion {
  const perm = permutationFor(preguntaId, testSeed);
  const idx = perm.indexOf(originalCorrecta);
  return (["a", "b", "c"] as const)[idx];
}
