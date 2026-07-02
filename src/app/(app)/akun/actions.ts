"use server";

import { z } from "zod";
import { requireSession } from "@/server/require-session";
import { changeOwnPassword } from "@/server/services/user-service";

const schema = z.object({
  currentPassword: z.string().min(1, "Password lama wajib diisi."),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter."),
});

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ error?: string; success?: boolean }> {
  const user = await requireSession();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  try {
    await changeOwnPassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Gagal mengganti password." };
  }
}
