import { NextResponse } from "next/server";
import { z } from "zod";
import {
  setSessionCookie,
  signSession,
  verifyPassword,
} from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

const schema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1).max(200),
});

const FAILED_DELAY_MS = 200;

function fail() {
  return NextResponse.json(
    { ok: false, error: "Credenciales inválidas" },
    { status: 401 },
  );
}

async function delay(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Petición inválida" },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    await delay(FAILED_DELAY_MS);
    return fail();
  }

  const { username, password } = parsed.data;
  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, password_hash")
    .eq("username", username)
    .maybeSingle();

  if (error || !user) {
    await delay(FAILED_DELAY_MS);
    return fail();
  }

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) {
    await delay(FAILED_DELAY_MS);
    return fail();
  }

  const token = await signSession(user.id, user.username);
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
