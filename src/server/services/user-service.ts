import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function listUsers(tenantId: string) {
  return prisma.user.findMany({
    where: { tenantId },
    include: { userOutlets: { include: { outlet: true } } },
    orderBy: { name: "asc" },
  });
}

export type UserInput = {
  name: string;
  email: string;
  role: UserRole;
  outletIds: string[];
  pin?: string | null;
  password?: string;
};

export async function createUser(tenantId: string, input: UserInput) {
  if (!input.password) {
    throw new Error("Kata sandi wajib diisi untuk karyawan baru.");
  }
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email sudah dipakai akun lain. Coba email lain.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        name: input.name,
        email,
        role: input.role,
        pin: input.pin || null,
        passwordHash,
      },
    });
    if (input.outletIds.length > 0) {
      await tx.userOutlet.createMany({
        data: input.outletIds.map((outletId) => ({ tenantId, userId: user.id, outletId })),
      });
    }
    return user;
  });
}

export async function updateUser(
  tenantId: string,
  id: string,
  input: Omit<UserInput, "password"> & { password?: string }
) {
  const user = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!user) throw new Error("Karyawan tidak ditemukan.");

  const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : undefined;

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id },
      data: {
        name: input.name,
        role: input.role,
        pin: input.pin || null,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    await tx.userOutlet.deleteMany({ where: { tenantId, userId: id } });
    if (input.outletIds.length > 0) {
      await tx.userOutlet.createMany({
        data: input.outletIds.map((outletId) => ({ tenantId, userId: id, outletId })),
      });
    }
  });
}

export async function changeOwnPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Akun tidak ditemukan.");

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Password lama salah. Coba periksa lagi.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function setUserActive(tenantId: string, id: string, isActive: boolean, actorId: string) {
  if (id === actorId && !isActive) {
    throw new Error("Kamu tidak bisa menonaktifkan akunmu sendiri.");
  }
  const user = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!user) throw new Error("Karyawan tidak ditemukan.");
  return prisma.user.update({ where: { id }, data: { isActive } });
}
