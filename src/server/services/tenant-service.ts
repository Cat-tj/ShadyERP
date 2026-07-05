import bcrypt from "bcryptjs";
import { ulid } from "ulid";
import { prisma } from "@/lib/prisma";
import type { BusinessType } from "@prisma/client";
import { CORE_MODULE_KEYS, MODULES, resolveEnabledModules, type ModuleKey } from "@/lib/modules";

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
  tx: any,
  tenantId: string,
  outletId: string,
  businessType: BusinessType
) {
  if (businessType === "FNB") {
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
  } else if (businessType === "RETAIL") {
    const catSembako = await tx.category.create({ data: { tenantId, name: "Sembako" } });
    const catSnack = await tx.category.create({ data: { tenantId, name: "Makanan Ringan" } });

    const products = [
      { name: "Beras Premium 5kg", categoryId: catSembako.id, price: 75000, cost: 62000 },
      { name: "Minyak Goreng 1L", categoryId: catSembako.id, price: 18500, cost: 15000 },
      { name: "Keripik Singkong Balado", categoryId: catSnack.id, price: 12000, cost: 8000 },
      { name: "Mie Instan Goreng", categoryId: catSembako.id, price: 3500, cost: 2800 },
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
        data: { tenantId, productId: prod.id, outletId, qty: 100 },
      });

      await tx.stockReorderPoint.create({
        data: { tenantId, productId: prod.id, outletId, minQty: 15 },
      });
    }
  } else if (businessType === "BARBERSHOP") {
    const catHair = await tx.category.create({ data: { tenantId, name: "Potong Rambut" } });
    const catCare = await tx.category.create({ data: { tenantId, name: "Perawatan" } });

    const products = [
      { name: "Gentleman Haircut", categoryId: catHair.id, price: 45000, cost: 5000 },
      { name: "Premium Shaving", categoryId: catHair.id, price: 25000, cost: 3000 },
      { name: "Creambath & Head Massage", categoryId: catCare.id, price: 60000, cost: 10000 },
      { name: "Hair Coloring", categoryId: catCare.id, price: 90000, cost: 25000 },
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

export type TenantSettingInput = {
  taxPercent: number;
  pointsPerAmount: number;
  receiptFooter: string | null;
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
 * Ganti daftar modul yang dimatikan. Cuma Owner yang boleh manggil ini (dicek
 * di server action pemanggilnya). Modul core diabaikan kalau ikut terkirim —
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
