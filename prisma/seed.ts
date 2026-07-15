import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const DEMO_SLUG = "kopi-nusantara";

async function main() {
  const existing = await prisma.tenant.findUnique({ where: { slug: DEMO_SLUG } });
  if (existing) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "StockCountItem", "StockCount" CASCADE;`);
      await prisma.tenant.delete({ where: { id: existing.id } });
    } catch (e) {
      console.warn("Soft reset failed, running deep truncate...", e);
      await prisma.$executeRawUnsafe(`
        TRUNCATE TABLE 
          "StockCountItem", "StockCount", "StockAdjustment", "StockTransfer", "StockMovement", 
          "StockReceiptItem", "StockReceipt", "ProductCostHistory", "SaleItem", "SalePayment", 
          "Sale", "CashierShift", "ProductStock", "Product", "User", "Outlet", "Tenant" 
        CASCADE;
      `);
    }
    console.log("Data demo lama dihapus, membuat ulang...");
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const tenant = await prisma.tenant.create({
    data: {
      name: "Kopi Nusantara",
      slug: DEMO_SLUG,
      businessType: "FNB",
      plan: "FREE",
      setting: { create: {} },
    },
  });

  const [outletUtama, outletKedua] = await Promise.all([
    prisma.outlet.create({
      data: { tenantId: tenant.id, name: "Kopi Nusantara - Kemang", address: "Jl. Kemang Raya No. 10" },
    }),
    prisma.outlet.create({
      data: { tenantId: tenant.id, name: "Kopi Nusantara - BSD", address: "Ruko BSD Boulevard No. 5" },
    }),
  ]);

  const owner = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Budi Santoso",
      email: "owner@demo.id",
      passwordHash,
      role: "OWNER",
    },
  });
  const manager = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Sari Wulandari",
      email: "manager@demo.id",
      passwordHash,
      role: "MANAGER",
    },
  });
  const staff1 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Andi Pratama",
      email: "staff1@demo.id",
      passwordHash,
      role: "STAFF",
    },
  });
  const staff2 = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Dewi Lestari",
      email: "staff2@demo.id",
      passwordHash,
      role: "STAFF",
    },
  });

  await prisma.userOutlet.createMany({
    data: [
      { tenantId: tenant.id, userId: owner.id, outletId: outletUtama.id },
      { tenantId: tenant.id, userId: owner.id, outletId: outletKedua.id },
      { tenantId: tenant.id, userId: manager.id, outletId: outletUtama.id },
      { tenantId: tenant.id, userId: staff1.id, outletId: outletUtama.id },
      { tenantId: tenant.id, userId: staff2.id, outletId: outletKedua.id },
    ],
  });

  const [kategoriKopi, kategoriNonKopi, kategoriMakanan] = await Promise.all([
    prisma.category.create({ data: { tenantId: tenant.id, name: "Kopi" } }),
    prisma.category.create({ data: { tenantId: tenant.id, name: "Non-Kopi" } }),
    prisma.category.create({ data: { tenantId: tenant.id, name: "Makanan" } }),
  ]);

  const productDefs = [
    { name: "Kopi Susu", categoryId: kategoriKopi.id, price: 18000, cost: 8000 },
    { name: "Americano", categoryId: kategoriKopi.id, price: 20000, cost: 7000 },
    { name: "Cappuccino", categoryId: kategoriKopi.id, price: 25000, cost: 10000 },
    { name: "Kopi Tubruk", categoryId: kategoriKopi.id, price: 15000, cost: 5000 },
    { name: "Es Teh Manis", categoryId: kategoriNonKopi.id, price: 10000, cost: 3000 },
    { name: "Matcha Latte", categoryId: kategoriNonKopi.id, price: 23000, cost: 11000 },
    { name: "Air Mineral", categoryId: kategoriNonKopi.id, price: 6000, cost: 3000 },
    { name: "Roti Bakar Coklat", categoryId: kategoriMakanan.id, price: 15000, cost: 6000 },
    { name: "Croissant", categoryId: kategoriMakanan.id, price: 18000, cost: 8000 },
    { name: "Nasi Goreng Kampung", categoryId: kategoriMakanan.id, price: 28000, cost: 13000 },
  ];

  for (const def of productDefs) {
    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: def.categoryId,
        name: def.name,
        price: def.price,
        cost: def.cost,
        trackStock: true,
      },
    });
    await prisma.productStock.createMany({
      data: [
        { tenantId: tenant.id, productId: product.id, outletId: outletUtama.id, qty: 50 },
        { tenantId: tenant.id, productId: product.id, outletId: outletKedua.id, qty: 30 },
      ],
    });
  }

  const memberDefs = [
    { name: "Rina Amelia", phone: "081200000001", points: 120, depositBalance: 0 },
    { name: "Fajar Nugroho", phone: "081200000002", points: 45, depositBalance: 50000 },
    { name: "Siti Nurhaliza", phone: "081200000003", points: 0, depositBalance: 0 },
    { name: "Bayu Aji", phone: "081200000004", points: 300, depositBalance: 0 },
    { name: "Putri Ayu", phone: "081200000005", points: 15, depositBalance: 20000 },
  ];

  for (const def of memberDefs) {
    await prisma.member.create({
      data: {
        tenantId: tenant.id,
        name: def.name,
        phone: def.phone,
        points: def.points,
        depositBalance: def.depositBalance,
      },
    });
  }

  console.log("Selesai! Data demo Kopi Nusantara siap dipakai.");
  console.log("Login owner: owner@demo.id / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
