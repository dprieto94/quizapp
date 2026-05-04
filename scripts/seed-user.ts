// QuizApp — seed user (Fase 2)
// Crea o actualiza la usuaria `karla` (o el username pasado por argv) con bcrypt cost 10.
// Lee SEED_USER_PASSWORD de .env.local — obligatoria, sin default.
// Idempotente: el upsert con onConflict: "username" permite también resetear contraseña.

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

  const { data, error } = await supabase
    .from("users")
    .upsert(
      { username, password_hash: passwordHash },
      { onConflict: "username" },
    )
    .select("id, username, created_at")
    .single();

  if (error) {
    console.error("Failed to seed user:", error.message);
    process.exit(1);
  }

  console.log("User seeded:", data);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
