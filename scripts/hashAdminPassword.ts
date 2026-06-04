import { hash } from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: npx tsx scripts/hashAdminPassword.ts <plain-password>");
    process.exit(1);
  }
  const out = await hash(password, 10);

  // Next.js's env loader (@next/env + dotenv-expand) treats `$` as a
  // variable-reference prefix, so each `$` in the bcrypt hash must be
  // escaped with a backslash inside .env.local. Print the escaped form
  // ready to paste.
  const escaped = out.replace(/\$/g, "\\$");

  console.log("");
  console.log("Bcrypt hash (raw):", out);
  console.log("");
  console.log("Paste this line into .env.local exactly as shown:");
  console.log(`ADMIN_PASSWORD_HASH=${escaped}`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
