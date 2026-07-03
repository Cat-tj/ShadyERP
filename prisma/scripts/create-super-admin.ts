import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../../src/lib/prisma";

/**
 * Skrip sekali-jalan untuk membuat/reset akun super-admin pertama.
 * Jalankan: SUPER_ADMIN_EMAIL=... SUPER_ADMIN_PASSWORD=... SUPER_ADMIN_NAME=... npm run db:create-super-admin
 */
async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME?.trim() || "Super Admin";

  if (!email || !password) {
    console.error(
      "Wajib set env SUPER_ADMIN_EMAIL dan SUPER_ADMIN_PASSWORD. Contoh:\n" +
        "  SUPER_ADMIN_EMAIL=admin@altora.id SUPER_ADMIN_PASSWORD=rahasia-panjang npm run db:create-super-admin"
    );
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("Password super-admin minimal 8 karakter.");
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.superAdmin.upsert({
    where: { email },
    create: { email, passwordHash, name },
    update: { passwordHash, name },
  });

  console.log(`Super-admin siap: ${admin.email} (${admin.name})`);
}

main()
  .catch((error) => {
    console.error("Gagal membuat super-admin:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
