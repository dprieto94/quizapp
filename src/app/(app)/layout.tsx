import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <>
      <header className="border-b border-border bg-background">
        <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-primary">
            QuizApp
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/historico" className="hover:text-primary">
              Histórico
            </Link>
            <Link href="/configuracion" className="hover:text-primary">
              Configuración
            </Link>
            <Link href="/admin/preguntas" className="hover:text-primary">
              Admin
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-muted hover:text-danger">
                Salir
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="max-w-5xl mx-auto p-4 flex-1">{children}</main>
    </>
  );
}
