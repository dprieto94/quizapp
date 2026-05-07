import { listAsignaturas, listTemasWithCounts } from "@/lib/db";
import { TemasClient } from "./TemasClient";

type Props = {
  searchParams: Promise<{ asignaturaId?: string }>;
};

export default async function TemasPage({ searchParams }: Props) {
  const { asignaturaId } = await searchParams;
  const [asignaturas, temas] = await Promise.all([
    listAsignaturas(),
    listTemasWithCounts(),
  ]);
  const filtered = asignaturaId
    ? temas.filter((tema) => tema.asignatura_id === asignaturaId)
    : temas;

  return (
    <TemasClient
      asignaturas={asignaturas}
      temas={filtered}
      selectedAsignaturaId={asignaturaId ?? ""}
    />
  );
}
