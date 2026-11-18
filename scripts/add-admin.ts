// Torna um usuário admin (acesso ao /admin).
//
//   npm run admin:add -- seu-email@exemplo.com
//
// A pessoa precisa ter entrado no site pelo menos uma vez (o login cria o usuário).
// Usa a chave SECRETA do Supabase (SUPABASE_SECRET_KEY no .env.local).

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.ts";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("Uso: npm run admin:add -- seu-email@exemplo.com");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SECRET_KEY no .env.local.",
  );
  process.exit(1);
}

const supabase = createClient<Database>(url, secret, { auth: { persistSession: false } });

// Procura o usuário pelo e-mail (página por página; poucos usuários no começo).
let userId: string | undefined;
for (let page = 1; !userId; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
  if (error) {
    console.error("Erro ao listar usuários:", error.message);
    process.exit(1);
  }
  userId = data.users.find((u) => u.email?.toLowerCase() === email)?.id;
  if (data.users.length < 200) break;
}

if (!userId) {
  console.error(
    `Nenhum usuário com o e-mail ${email}. Entre no site uma vez (/entrar) e tente de novo.`,
  );
  process.exit(1);
}

const { error } = await supabase.from("admins").upsert({ user_id: userId });
if (error) {
  console.error("Erro ao gravar admin:", error.message);
  process.exit(1);
}
console.log(`${email} agora é admin. Acesse /admin.`);
