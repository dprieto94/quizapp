export function calcularNota(
  aciertos: number,
  fallos: number,
  penalizacion: number,
  totalPreguntas = 20,
): number {
  const raw = aciertos - fallos * penalizacion;
  const nota = Math.max(0, (raw / totalPreguntas) * 10);
  return Math.round(nota * 100) / 100;
}
