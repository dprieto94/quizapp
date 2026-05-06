import { redirect } from "next/navigation";
import { Nav } from "@/components/Nav";
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
      <Nav />
      <main className="max-w-5xl mx-auto p-4 flex-1">{children}</main>
    </>
  );
}
