import { getConfig } from "@/lib/db";
import { ConfigForm } from "./ConfigForm";

export default async function ConfiguracionPage() {
  const config = await getConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="mt-1 text-sm text-muted">
          Parámetros globales del test. Los cambios afectan a los tests futuros; los
          pasados conservan su snapshot.
        </p>
      </div>
      <ConfigForm config={config} />
    </div>
  );
}
