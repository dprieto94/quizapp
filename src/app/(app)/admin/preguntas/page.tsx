import {
  listAsignaturas,
  listPreguntas,
  listTemasByAsignatura,
  listTemasWithAsignatura,
} from "@/lib/db";
import { PreguntasClient } from "./PreguntasClient";

type Props = {
  searchParams: Promise<{ asignaturaId?: string; temaId?: string; q?: string }>;
};

export default async function PreguntasPage({ searchParams }: Props) {
  const { asignaturaId, temaId, q } = await searchParams;
  const [asignaturas, allTemas, filterTemas, preguntas] = await Promise.all([
    listAsignaturas(),
    listTemasWithAsignatura(),
    asignaturaId ? listTemasByAsignatura(asignaturaId) : Promise.resolve([]),
    listPreguntas({ asignaturaId, temaId, q }),
  ]);

  return (
    <PreguntasClient
      asignaturas={asignaturas}
      allTemas={allTemas}
      filterTemas={filterTemas}
      preguntas={preguntas}
      filters={{
        asignaturaId: asignaturaId ?? "",
        temaId: temaId ?? "",
        q: q ?? "",
      }}
    />
  );
}
