import bcrypt from "bcryptjs";
import { prisma } from "../../src/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    where: { legacyPin: { not: null }, pinHash: null },
    select: { id: true, legacyPin: true },
  });

  for (const user of users) {
    if (!user.legacyPin || !/^\d{6}$/.test(user.legacyPin)) {
      throw new Error(`PIN lama tidak valid pada user ${user.id}; reset PIN secara manual sebelum melanjutkan.`);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { pinHash: await bcrypt.hash(user.legacyPin, 10), legacyPin: null },
    });
  }

  console.log(`Backfill PIN selesai: ${users.length} akun diproses.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
