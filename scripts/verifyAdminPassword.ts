import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { compare } from "bcryptjs";

async function main() {
  const candidate = process.argv[2];
  if (!candidate) {
    console.error("Usage: npx tsx scripts/verifyAdminPassword.ts '<plain-password>'");
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL ?? "";
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";

  console.log("Diagnostics:");
  console.log("  ADMIN_EMAIL:           ", email || "(missing)");
  console.log("  ADMIN_PASSWORD_HASH:   ", hash ? `[${hash.length} chars] ${hash.slice(0, 7)}…${hash.slice(-4)}` : "(missing)");
  console.log("  Hash looks bcrypt:     ", /^\$2[aby]\$/.test(hash));
  console.log("  Submitted password len:", candidate.length);
  console.log("");

  if (!hash) {
    console.error("✗ ADMIN_PASSWORD_HASH is not set in .env.local");
    process.exit(1);
  }

  try {
    const ok = await compare(candidate, hash);
    if (ok) {
      console.log("✓ MATCH — this password verifies against the stored hash.");
      console.log("  If the web login still fails, the dev server hasn't reloaded");
      console.log("  the updated .env.local. Stop and re-run `npm run dev`.");
      process.exit(0);
    } else {
      console.error("✗ NO MATCH — the password does not verify against the hash.");
      console.error("  Either the password you typed differs from the one you hashed,");
      console.error("  or the hash got mangled in .env.local (truncation, $ escaping).");
      console.error("");
      console.error("  To re-hash: npx tsx scripts/hashAdminPassword.ts 'YourPassword'");
      process.exit(1);
    }
  } catch (err) {
    console.error("✗ bcrypt.compare threw:", err);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
