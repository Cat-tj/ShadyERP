import "dotenv/config";
import { prisma } from "../../src/lib/prisma";

const DEMO_SLUG = "kopi-nusantara";

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: DEMO_SLUG } });
  if (!tenant) {
    console.log("Tidak ada data demo (tenant 'kopi-nusantara') di database ini. Sudah bersih.");
    return;
  }

  await prisma.tenant.delete({ where: { id: tenant.id } });
  console.log(`Data demo "${tenant.name}" dan semua isinya (produk, transaksi, member, dll) sudah dihapus.`);
}

main()
  .catch((error) => {
    console.error("Gagal menghapus data demo:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
