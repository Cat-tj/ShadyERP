import bcrypt from "bcryptjs";
import { ulid } from "ulid";
import { prisma } from "@/lib/prisma";
import type { BusinessType, Prisma } from "@prisma/client";
import { CORE_MODULE_KEYS, MODULES, resolveEnabledModules, type ModuleKey } from "@/lib/modules";
import { normalizeBusinessMode } from "@/lib/business-modes";

export type RegisterTenantInput = {
  businessName: string;
  businessType: BusinessType;
  outletName: string;
  ownerName: string;
  email: string;
  password: string;
  disabledModules?: string[];
  seedSampleData?: boolean;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function generateUniqueSlug(businessName: string) {
  const base = slugify(businessName) || "usaha";
  const existing = await prisma.tenant.findUnique({ where: { slug: base } });
  if (!existing) return base;
  return `${base}-${ulid().slice(-6).toLowerCase()}`;
}

async function bootstrapTenantSampleData(
  tx: Prisma.TransactionClient,
  tenantId: string,
  outletId: string,
  businessType: BusinessType
) {
  const mode = normalizeBusinessMode(businessType);

  if (mode === "CAFE") {
    const catMakanan = await tx.category.create({ data: { tenantId, name: "Makanan" } });
    const catMinuman = await tx.category.create({ data: { tenantId, name: "Minuman" } });

    const products = [
      { name: "Kopi Susu Gula Aren", categoryId: catMinuman.id, price: 18000, cost: 7000 },
      { name: "Americano", categoryId: catMinuman.id, price: 15000, cost: 5000 },
      { name: "Nasi Goreng Spesial", categoryId: catMakanan.id, price: 25000, cost: 12000 },
      { name: "Roti Bakar Coklat", categoryId: catMakanan.id, price: 15000, cost: 6000 },
    ];

    for (const p of products) {
      const prod = await tx.product.create({
        data: {
          tenantId,
          categoryId: p.categoryId,
          name: p.name,
          price: p.price,
          cost: p.cost,
          trackStock: true,
        },
      });

      await tx.productStock.create({
        data: { tenantId, productId: prod.id, outletId, qty: 50 },
      });

      await tx.stockReorderPoint.create({
        data: { tenantId, productId: prod.id, outletId, minQty: 10 },
      });
    }

    const tables = ["Meja 01", "Meja 02", "Meja 03"];
    for (const tableName of tables) {
      await tx.table.create({
        data: {
          tenantId,
          outletId,
          name: tableName,
          qrToken: ulid(),
        },
      });
    }
  } else if (mode === "TOKO") {
    const catOrganic = await tx.category.create({ data: { tenantId, name: "Organic Goods" } });
    const catSnack = await tx.category.create({ data: { tenantId, name: "Healthy Snack" } });

    const products = [
      { name: "Organic Almond Milk 1L", sku: "ALT-TOKO-0001", categoryId: catOrganic.id, price: 82000, cost: 61000, trackExpiry: true },
      { name: "Gluten Free Granola 500g", sku: "ALT-TOKO-0002", categoryId: catSnack.id, price: 69000, cost: 48000, trackExpiry: true },
      { name: "Raw Honey 350g", sku: "ALT-TOKO-0003", categoryId: catOrganic.id, price: 95000, cost: 70000, trackExpiry: true },
      { name: "Kombucha Ginger 330ml", sku: "ALT-TOKO-0004", categoryId: catOrganic.id, price: 38000, cost: 25000, trackExpiry: true },
    ];

    for (const p of products) {
      const prod = await tx.product.create({
        data: {
          tenantId,
          categoryId: p.categoryId,
          name: p.name,
          sku: p.sku,
          price: p.price,
          cost: p.cost,
          trackStock: true,
          trackExpiry: p.trackExpiry,
          shelfLifeDays: 180,
        },
      });

      await tx.productStock.create({
        data: { tenantId, productId: prod.id, outletId, qty: 100 },
      });

      await tx.stockReorderPoint.create({
        data: { tenantId, productId: prod.id, outletId, minQty: 15 },
      });
    }
  } else if (mode === "COUNTER") {
    const catAksesoris = await tx.category.create({ data: { tenantId, name: "Aksesoris HP" } });
    const catService = await tx.category.create({ data: { tenantId, name: "Service" } });

    const products = [
      { name: "Kabel Type-C 1m", sku: "ALT-CTR-0001", categoryId: catAksesoris.id, price: 35000, cost: 18000, kind: "GOODS" as const, warrantyDays: 30 },
      { name: "Charger 20W", sku: "ALT-CTR-0002", categoryId: catAksesoris.id, price: 85000, cost: 52000, kind: "GOODS" as const, warrantyDays: 90 },
      { name: "Ganti LCD", sku: null, categoryId: catService.id, price: 250000, cost: 0, kind: "SERVICE" as const, warrantyDays: 14 },
    ];

    for (const p of products) {
      const prod = await tx.product.create({
        data: {
          tenantId,
          categoryId: p.categoryId,
          name: p.name,
          sku: p.sku,
          price: p.price,
          cost: p.cost,
          kind: p.kind,
          trackStock: p.kind === "GOODS",
          warrantyDays: p.warrantyDays,
          serviceDurationMin: p.kind === "SERVICE" ? 60 : null,
        },
      });
      if (p.kind === "GOODS") {
        await tx.productStock.create({ data: { tenantId, productId: prod.id, outletId, qty: 25 } });
        await tx.stockReorderPoint.create({ data: { tenantId, productId: prod.id, outletId, minQty: 5 } });
      }
    }
  } else if (mode === "LAUNDRY") {
    await tx.laundryService.createMany({
      data: [
        { tenantId, name: "Kiloan Reguler", serviceType: "KILOAN", pricePerKg: 8000, sortOrder: 1 },
        { tenantId, name: "Express", serviceType: "EXPRESS", pricePerKg: 14000, sortOrder: 2 },
        { tenantId, name: "Setrika Satuan", serviceType: "SETRIKA", servicePrice: 5000, sortOrder: 3 },
      ],
    });
  } else {
    const catUmum = await tx.category.create({ data: { tenantId, name: "Layanan Umum" } });

    const products = [
      { name: "Layanan Standar", categoryId: catUmum.id, price: 50000, cost: 0 },
      { name: "Layanan Premium", categoryId: catUmum.id, price: 100000, cost: 0 },
    ];

    for (const p of products) {
      await tx.product.create({
        data: {
          tenantId,
          categoryId: p.categoryId,
          name: p.name,
          price: p.price,
          cost: p.cost,
          trackStock: false,
        },
      });
    }
  }
}

/**
 * Bootstrap satu-satunya alur yang boleh membuat Tenant baru tanpa tenantId
 * sesi (karena tenant-nya belum ada). Semua service lain WAJIB menerima
 * tenantId dan memfilter query dengannya.
 */
export async function registerTenant(input: RegisterTenantInput) {
  const email = input.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error("Email sudah terdaftar. Coba masuk atau pakai email lain.");
  }

  const slug = await generateUniqueSlug(input.businessName);
  const passwordHash = await bcrypt.hash(input.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: input.businessName,
        slug,
        businessType: input.businessType,
        plan: "FREE",
        disabledModules: input.disabledModules ?? [],
      },
    });

    const outlet = await tx.outlet.create({
      data: {
        tenantId: tenant.id,
        name: input.outletName,
      },
    });

    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        name: input.ownerName,
        email,
        passwordHash,
        role: "OWNER",
      },
    });

    await tx.userOutlet.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        outletId: outlet.id,
      },
    });

    await tx.tenantSetting.create({
      data: {
        tenantId: tenant.id,
      },
    });

    if (input.seedSampleData) {
      await bootstrapTenantSampleData(tx, tenant.id, outlet.id, input.businessType);
    }

    return { tenant, outlet, user };
  });

  return result;
}

import type { AccountingMode } from "@prisma/client";

export type TenantSettingInput = {
  taxPercent: number;
  pointsPerAmount: number;
  receiptFooter: string | null;
  staticQrisPayload?: string | null;
  accountingMode?: AccountingMode;
  stampProgramEnabled?: boolean;
  stampTarget?: number;
  stampRewardName?: string | null;
  stampRewardValue?: number;
};

export async function getTenantSetting(tenantId: string) {
  return prisma.tenantSetting.findUnique({ where: { tenantId } });
}

export async function updateTenantSetting(tenantId: string, input: TenantSettingInput) {
  return prisma.tenantSetting.upsert({
    where: { tenantId },
    create: { tenantId, ...input },
    update: input,
  });
}

export async function updateTenantBusinessType(tenantId: string, businessType: BusinessType) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data: { businessType },
  });
}

/**
 * Modul mana yang aktif buat tenant ini. Modul core selalu ikut walau tidak
 * ada di database — lihat resolveEnabledModules di src/lib/modules.ts.
 */
export async function getEnabledModules(tenantId: string): Promise<Set<ModuleKey>> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { disabledModules: true } });
  if (!tenant) throw new Error("Tenant tidak ditemukan.");
  return resolveEnabledModules(tenant.disabledModules);
}

/**
 * Ganti daftar modul yang dimatikan. Cuma pemanggil yang sudah dijaga server action
 * boleh memakai ini. Modul core diabaikan kalau ikut terkirim —
 * tidak pernah bisa dimatikan.
 */
export async function setDisabledModules(tenantId: string, disabledKeys: ModuleKey[]) {
  const validKeys = new Set(MODULES.map((m) => m.key));
  const coreKeys = new Set(CORE_MODULE_KEYS);
  const cleaned = [...new Set(disabledKeys)].filter((key) => validKeys.has(key) && !coreKeys.has(key));

  return prisma.tenant.update({
    where: { id: tenantId },
    data: { disabledModules: cleaned },
  });
}
