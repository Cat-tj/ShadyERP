import bcrypt from "bcryptjs";
import { ulid } from "ulid";
import { prisma } from "@/lib/prisma";
import type { BusinessType } from "@prisma/client";

export type RegisterTenantInput = {
  businessName: string;
  businessType: BusinessType;
  outletName: string;
  ownerName: string;
  email: string;
  password: string;
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
