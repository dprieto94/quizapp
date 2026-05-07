import { listAsignaturasWithCounts } from "@/lib/db";
import { AsignaturasClient } from "./AsignaturasClient";

export default async function AsignaturasPage() {
  const asignaturas = await listAsignaturasWithCounts();
  return <AsignaturasClient asignaturas={asignaturas} />;
}
