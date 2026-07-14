import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { assertCanAddUser } from "@/server/services/billing-service";
import { recordAuditLog } from "@/server/services/audit-log-service";
import type { UserRole } from "@prisma/client";

/**
 * PERINGATAN MULTI-TENANT: setiap query WAJIB menyertakan `where: { tenantId }`.
 */

export async function listUsers(tenantId: string) {
  return prisma.user.findMany({
    where: { tenantId },
    // Jangan ambil passwordHash, pinHash, atau legacyPin untuk daftar UI.
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      jobTitle: true,
      isActive: true,
      userOutlets: { select: { outletId: true, outlet: { select: { name: true } } } },
    },
    orderBy: { name: "asc" },
  });
}

export type UserInput = {
  name: string;
  email: string;
  role: UserRole;
  outletIds: string[];
  /** PIN baru opsional. Tidak pernah dipakai untuk mengirim PIN tersimpan. */
  pin?: string;
  password?: string;
  jobTitle?: string | null;
};

export async function createUser(tenantId: string, input: UserInput) {
  if (!input.password) {
    throw new Error("Kata sandi wajib diisi untuk karyawan baru.");
  }
  await assertCanAddUser(tenantId);
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email sudah dipakai akun lain. Coba email lain.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const pinHash = input.pin ? await bcrypt.hash(input.pin, 10) : undefined;

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenantId,
        name: input.name,
        email,
        role: input.role,
        ...(pinHash ? { pinHash } : {}),
        passwordHash,
        jobTitle: input.jobTitle || null,
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
  input: Omit<UserInput, "password"> & { password?: string },
  changedById: string
) {
  const user = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!user) throw new Error("Karyawan tidak ditemukan.");

  const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : undefined;
  const pinHash = input.pin ? await bcrypt.hash(input.pin, 10) : undefined;

  return prisma.$transaction(async (tx) => {
    if (passwordHash) {
      await recordAuditLog(
        tx,
        tenantId,
        changedById,
        "USER_PASSWORD_RESET",
        `Reset kata sandi karyawan ${user.name}`
      );
    }

    await tx.user.update({
      where: { id },
      data: {
        name: input.name,
        role: input.role,
        jobTitle: input.jobTitle || null,
        ...(passwordHash ? { passwordHash } : {}),
        ...(pinHash ? { pinHash } : {}),
        sessionVersion: { increment: 1 },
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
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, sessionVersion: { increment: 1 } },
  });
}

export async function setUserActive(tenantId: string, id: string, isActive: boolean, actorId: string) {
  if (id === actorId && !isActive) {
    throw new Error("Kamu tidak bisa menonaktifkan akunmu sendiri.");
  }
  const user = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!user) throw new Error("Karyawan tidak ditemukan.");
  return prisma.user.update({
    where: { id },
    data: { isActive, sessionVersion: { increment: 1 } },
  });
}
