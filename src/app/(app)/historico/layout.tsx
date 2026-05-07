import { HistoricoTab } from "@/components/historico/HistoricoTab";

export default function HistoricoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Histórico</h1>
        <p className="mt-1 text-sm text-muted">
          Todos tus tests realizados, filtros y estadísticas.
        </p>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-border">
        <HistoricoTab href="/historico" exact>
          Tests
        </HistoricoTab>
        <HistoricoTab href="/historico/estadisticas">Estadísticas</HistoricoTab>
      </nav>
      {children}
    </div>
  );
}
