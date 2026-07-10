"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/require-session";
import { createLead, updateLead, deleteLead } from "@/server/services/lead-service";
import type { LeadStatus } from "@prisma/client";

export async function createLeadAction(input: {
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  interest?: string;
  expectedValue?: number;
  nextFollowUpAtStr?: string;
  notes?: string;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  try {
    const nextFollowUpAt = input.nextFollowUpAtStr ? new Date(input.nextFollowUpAtStr) : null;
    await createLead(user.tenantId, {
      name: input.name,
      phone: input.phone,
      email: input.email,
      source: input.source,
      interest: input.interest,
      expectedValue: input.expectedValue,
      nextFollowUpAt,
      notes: input.notes,
    });

    revalidatePath("/crm");
    return { succeeded: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan internal.";
    return { succeeded: false, message: msg };
  }
}

export async function updateLeadAction(
  id: string,
  input: {
    name: string;
    phone?: string;
    email?: string;
    source?: string;
    interest?: string;
    expectedValue?: number;
    nextFollowUpAtStr?: string;
    status: LeadStatus;
    notes?: string;
  }
) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  try {
    const nextFollowUpAt = input.nextFollowUpAtStr ? new Date(input.nextFollowUpAtStr) : null;
    await updateLead(user.tenantId, id, {
      name: input.name,
      phone: input.phone,
      email: input.email,
      source: input.source,
      interest: input.interest,
      expectedValue: input.expectedValue,
      nextFollowUpAt,
      status: input.status,
      notes: input.notes,
    });

    revalidatePath("/crm");
    return { succeeded: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan internal.";
    return { succeeded: false, message: msg };
  }
}

export async function deleteLeadAction(id: string) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  try {
    await deleteLead(user.tenantId, id);
    revalidatePath("/crm");
    return { succeeded: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan internal.";
    return { succeeded: false, message: msg };
  }
}
