import { Card } from "@/components/ui/Card";
import type { Config } from "@/types";

type Props = { config: Config };

export function ModosInfo({ config }: Props) {
  return (
    <Card>
      <h2 className="text-lg font-semibold">Modos de test</h2>
      <p className="mt-1 text-sm text-muted">
        Recordatorio de cómo se comporta cada modo. Esto no se edita aquí — se elige al
        empezar un test desde la pantalla de la asignatura.
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-border">
              <th className="py-2 pr-4 font-medium">Característica</th>
              <th className="py-2 pr-4 font-medium">Examen</th>
              <th className="py-2 font-medium">Estudio</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-3 pr-4 font-medium">Timer</td>
              <td className="py-3 pr-4">{config.timer_minutos} min · no pausable</td>
              <td className="py-3 text-muted">—</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 pr-4 font-medium">Penalización por fallo</td>
              <td className="py-3 pr-4">−{config.penalizacion}</td>
              <td className="py-3 text-muted">—</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 pr-4 font-medium">Feedback por pregunta</td>
              <td className="py-3 pr-4 text-muted">Al final del test</td>
              <td className="py-3">Inmediato al seleccionar opción</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 pr-4 font-medium">Resultado</td>
              <td className="py-3 pr-4">Nota sobre 10</td>
              <td className="py-3">Porcentaje de aciertos</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-3 pr-4 font-medium">Justificación al fallar</td>
              <td className="py-3 pr-4 text-muted">En la pantalla de resultado</td>
              <td className="py-3">Inline tras seleccionar</td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-medium">Marcar dudosa</td>
              <td className="py-3 pr-4">Sí</td>
              <td className="py-3">Sí</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-5 text-xs text-muted">
        Los tests ya realizados conservan los parámetros con los que se hicieron
        (snapshot). Cambiar penalización, timer o nº de preguntas afecta solo a tests
        futuros — el histórico no se recalcula.
      </p>
    </Card>
  );
}
