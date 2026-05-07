// QuizApp — seed user (Fase 2 + Fase 11.5)
// Crea o actualiza el usuario `karla` (o el username pasado por argv) con bcrypt cost 10
// e inserta su fila de `config` con los defaults del schema (penalizacion=0.50,
// timer_minutos=45, preguntas_por_test=20).
//
// Lee SEED_USER_PASSWORD de .env.local — obligatoria, sin default.
// Idempotente: el upsert sobre `users` (onConflict username) y sobre `config`
// (onConflict user_id) permite resetear contraseña sin tocar la config existente.

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const password = process.env.SEED_USER_PASSWORD;

  if (!url) {
    console.error("NEXT_PUBLIC_SUPABASE_URL is required");
    process.exit(1);
  }
  if (!secretKey) {
    console.error("SUPABASE_SECRET_KEY is required");
    process.exit(1);
  }
  if (!password) {
    console.error("SEED_USER_PASSWORD is required (set it in .env.local)");
    process.exit(1);
  }

  const username = process.argv[2] ?? "karla";
  const passwordHash = bcrypt.hashSync(password, 10);

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false },
  });

  const { data: user, error: userError } = await supabase
    .from("users")
    .upsert(
      { username, password_hash: passwordHash },
      { onConflict: "username" },
    )
    .select("id, username, created_at")
    .single();

  if (userError) {
    console.error("Failed to seed user:", userError.message);
    process.exit(1);
  }

  const { error: configError } = await supabase
    .from("config")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });

  if (configError) {
    console.error("Failed to seed config for user:", configError.message);
    process.exit(1);
  }

  console.log("User seeded:", user);
  console.log("Config seeded with defaults for user_id:", user.id);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
