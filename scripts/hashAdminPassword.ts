import { hash } from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: npx tsx scripts/hashAdminPassword.ts <plain-password>");
    process.exit(1);
  }
  const out = await hash(password, 10);
  console.log(out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
