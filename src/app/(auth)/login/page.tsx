import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

type SearchParams = Promise<{ from?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (session) redirect("/");

  const { from } = await searchParams;
  const redirectTo = typeof from === "string" && from.startsWith("/") ? from : "/";

  return <LoginForm redirectTo={redirectTo} />;
}
