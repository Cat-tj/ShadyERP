import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

const SLUG = "toko-berkah-sejahtera";
const PAYMENT_METHODS = ["CASH", "QRIS", "TRANSFER", "EWALLET"] as const;

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

async function main() {
  const existing = await prisma.tenant.findUnique({ where: { slug: SLUG } });
  if (existing) {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "StockCountItem", "StockCount", "StockAdjustment", "StockTransfer", "StockMovement",
        "StockReceiptItem", "StockReceipt", "PurchaseOrderItem", "PurchaseOrder", "Supplier",
        "ProductCostHistory", "SalePayment", "SaleItem", "Sale", "Expense", "CashierShift",
        "ProductStock", "Product", "User", "Outlet", "Tenant"
      CASCADE;
    `);
    console.log("Data showcase lama dihapus, membuat ulang...");
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const tenant = await prisma.tenant.create({
    data: {
      name: "Toko Berkah Sejahtera",
      slug: SLUG,
      businessType: "RETAIL",
      plan: "PRO",
      setting: { create: {} },
    },
  });

  const [outletUtama, outletKedua] = await Promise.all([
    prisma.outlet.create({ data: { tenantId: tenant.id, name: "Berkah Sejahtera - Pasar Minggu", address: "Jl. Pasar Minggu Raya No. 45" } }),
    prisma.outlet.create({ data: { tenantId: tenant.id, name: "Berkah Sejahtera - Kalibata", address: "Jl. Kalibata Utama No. 12" } }),
  ]);

  const owner = await prisma.user.create({
    data: { tenantId: tenant.id, name: "Hendra Wijaya", email: "owner@showcase.id", passwordHash, role: "OWNER" },
  });
  const manager = await prisma.user.create({
    data: { tenantId: tenant.id, name: "Lina Marlina", email: "manager@showcase.id", passwordHash, role: "MANAGER" },
  });
  const staff1 = await prisma.user.create({
    data: { tenantId: tenant.id, name: "Doni Firmansyah", email: "staff1@showcase.id", passwordHash, role: "STAFF" },
  });

  await prisma.userOutlet.createMany({
    data: [
      { tenantId: tenant.id, userId: owner.id, outletId: outletUtama.id },
      { tenantId: tenant.id, userId: owner.id, outletId: outletKedua.id },
      { tenantId: tenant.id, userId: manager.id, outletId: outletUtama.id },
      { tenantId: tenant.id, userId: staff1.id, outletId: outletUtama.id },
    ],
  });

  const [kSembako, kMinuman, kRumahTangga] = await Promise.all([
    prisma.category.create({ data: { tenantId: tenant.id, name: "Sembako" } }),
    prisma.category.create({ data: { tenantId: tenant.id, name: "Minuman" } }),
    prisma.category.create({ data: { tenantId: tenant.id, name: "Rumah Tangga" } }),
  ]);

  const productDefs = [
    { name: "Beras Premium 5kg", categoryId: kSembako.id, price: 68000, cost: 58000 },
    { name: "Minyak Goreng 2L", categoryId: kSembako.id, price: 34000, cost: 28000 },
    { name: "Gula Pasir 1kg", categoryId: kSembako.id, price: 16000, cost: 13000 },
    { name: "Telur Ayam 1kg", categoryId: kSembako.id, price: 29000, cost: 24000 },
    { name: "Tepung Terigu 1kg", categoryId: kSembako.id, price: 13000, cost: 10500 },
    { name: "Aqua 600ml", categoryId: kMinuman.id, price: 4000, cost: 2800 },
    { name: "Teh Botol Sosro", categoryId: kMinuman.id, price: 6000, cost: 4200 },
    { name: "Kopi Kapal Api Sachet", categoryId: kMinuman.id, price: 2000, cost: 1300 },
    { name: "Sabun Mandi Batang", categoryId: kRumahTangga.id, price: 5500, cost: 3800 },
    { name: "Deterjen Bubuk 800g", categoryId: kRumahTangga.id, price: 18000, cost: 14500 },
    { name: "Sabun Cuci Piring 800ml", categoryId: kRumahTangga.id, price: 15000, cost: 11500 },
    { name: "Tisu Gulung 4pcs", categoryId: kRumahTangga.id, price: 12000, cost: 9000 },
  ];

  const products = [];
  for (const def of productDefs) {
    const product = await prisma.product.create({
      data: { tenantId: tenant.id, categoryId: def.categoryId, name: def.name, price: def.price, cost: def.cost, trackStock: true },
    });
    products.push(product);
    await prisma.productStock.createMany({
      data: [
        { tenantId: tenant.id, productId: product.id, outletId: outletUtama.id, qty: randInt(20, 90) },
        { tenantId: tenant.id, productId: product.id, outletId: outletKedua.id, qty: randInt(10, 60) },
      ],
    });
  }

  const outlets = [outletUtama, outletKedua];
  const cashiers = [owner, manager, staff1];

  console.log("Membuat 30 hari transaksi penjualan...");
  let invoiceSeq = 1;
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    const day = new Date();
    day.setDate(day.getDate() - dayOffset);
    const salesToday = randInt(14, 32);

    for (let s = 0; s < salesToday; s++) {
      const outlet = pick(outlets);
      const cashier = pick(cashiers);
      const itemCount = randInt(1, 5);
      const chosenProducts = [...products].sort(() => Math.random() - 0.5).slice(0, itemCount);

      let subtotal = 0;
      const itemsData = chosenProducts.map((p) => {
        const qty = randInt(1, 4);
        const lineSubtotal = p.price * qty;
        subtotal += lineSubtotal;
        return { product: p, qty, subtotal: lineSubtotal };
      });

      const total = subtotal;
      const method = pick(PAYMENT_METHODS);
      const saleTime = new Date(day);
      saleTime.setHours(randInt(8, 20), randInt(0, 59), 0, 0);

      const sale = await prisma.sale.create({
        data: {
          tenantId: tenant.id,
          outletId: outlet.id,
          cashierId: cashier.id,
          invoiceNumber: `INV-${day.getFullYear()}${String(day.getMonth() + 1).padStart(2, "0")}${String(day.getDate()).padStart(2, "0")}-${String(invoiceSeq++).padStart(4, "0")}`,
          subtotal,
          total,
          paymentMethod: method,
          amountPaid: total,
          status: "COMPLETED",
          createdAt: saleTime,
        },
      });

      await prisma.saleItem.createMany({
        data: itemsData.map((it) => ({
          tenantId: tenant.id,
          saleId: sale.id,
          productId: it.product.id,
          productName: it.product.name,
          price: it.product.price,
          qty: it.qty,
          subtotal: it.subtotal,
        })),
      });

      await prisma.salePayment.create({
        data: { tenantId: tenant.id, saleId: sale.id, method, amount: total },
      });
    }

    // Pengeluaran harian (sewa, listrik, gaji, bahan baku) — beberapa hari saja biar realistis
    if (dayOffset % 4 === 0) {
      await prisma.expense.create({
        data: {
          tenantId: tenant.id,
          outletId: pick(outlets).id,
          createdById: owner.id,
          category: pick(["LISTRIK_AIR", "GAJI", "SEWA", "BAHAN_BAKU"] as const),
          amount: randInt(150000, 900000),
          note: "Biaya operasional harian",
          spentAt: day,
        },
      });
    }
  }

  const supplier = await prisma.supplier.create({
    data: {
      tenantId: tenant.id,
      name: "PT Sinar Jaya Distribusi",
      city: "Jakarta Selatan",
      phone: "021-7654321",
      paymentTerms: "Net 30",
      status: "ACTIVE",
    },
  });

  const po = await prisma.purchaseOrder.create({
    data: {
      tenantId: tenant.id,
      supplierId: supplier.id,
      poNumber: `PO-${Date.now()}-001`,
      status: "SENT",
      sentAt: new Date(),
      totalAmount: 4200000,
    },
  });
  await prisma.purchaseOrderItem.create({
    data: { poId: po.id, productId: products[0].id, qty: 60, unitPrice: 58000, subtotal: 3480000 },
  });

  const memberDefs = [
    { name: "Ratna Dewi", phone: "081300000001", points: 210 },
    { name: "Yusuf Hakim", phone: "081300000002", points: 95 },
    { name: "Melati Putri", phone: "081300000003", points: 40 },
  ];
  for (const def of memberDefs) {
    await prisma.member.create({ data: { tenantId: tenant.id, name: def.name, phone: def.phone, points: def.points } });
  }

  console.log("Selesai! Data showcase 'Toko Berkah Sejahtera' siap dipakai.");
  console.log("Login owner: owner@showcase.id / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
