import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listAsignaturas, listTests } from "@/lib/db";
import { HistoricoFilters } from "@/components/historico/HistoricoFilters";
import { HistoricoLista } from "@/components/historico/HistoricoLista";
import type { Modo } from "@/types";

type Props = {
  searchParams: Promise<{
    asignatura?: string;
    modo?: string;
    desde?: string;
    hasta?: string;
  }>;
};

export default async function HistoricoPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const modo: Modo | undefined =
    sp.modo === "examen" || sp.modo === "estudio" ? sp.modo : undefined;
  const filters = {
    asignaturaId: sp.asignatura,
    modo,
    desde: sp.desde,
    hasta: sp.hasta,
  };

  const [asignaturas, tests] = await Promise.all([
    listAsignaturas(),
    listTests(filters, session.userId),
  ]);

  return (
    <div className="space-y-6">
      <HistoricoFilters
        asignaturas={asignaturas}
        initial={{
          asignaturaId: filters.asignaturaId ?? "",
          modo: filters.modo ?? "",
          desde: filters.desde ?? "",
          hasta: filters.hasta ?? "",
        }}
      />
      <HistoricoLista tests={tests} />
    </div>
  );
}
