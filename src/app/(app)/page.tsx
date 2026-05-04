import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  return (
    <div>
      <h1 className="text-3xl font-semibold">Hola, {session!.username}</h1>
      <p className="text-muted mt-2">
        El home con asignaturas se construye en la Fase 7.
      </p>
    </div>
  );
}
