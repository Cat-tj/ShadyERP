import { prisma } from "@/lib/prisma";
import type { LeadStatus } from "@prisma/client";

export interface LeadInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  interest?: string | null;
  expectedValue?: number;
  nextFollowUpAt?: Date | null;
  status?: LeadStatus;
  notes?: string | null;
}

export async function createLead(tenantId: string, input: LeadInput) {
  return prisma.lead.create({
    data: {
      tenantId,
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      source: input.source || null,
      interest: input.interest || null,
      expectedValue: input.expectedValue ?? 0,
      nextFollowUpAt: input.nextFollowUpAt || null,
      status: input.status || "NEW",
      notes: input.notes || null,
    },
  });
}

export async function listLeads(tenantId: string) {
  return prisma.lead.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateLead(tenantId: string, id: string, input: Partial<LeadInput>) {
  const lead = await prisma.lead.findFirst({ where: { id, tenantId } });
  if (!lead) throw new Error("Lead tidak ditemukan.");

  return prisma.lead.update({
    where: { id },
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      source: input.source,
      interest: input.interest,
      expectedValue: input.expectedValue,
      nextFollowUpAt: input.nextFollowUpAt,
      status: input.status,
      notes: input.notes,
    },
  });
}

export async function deleteLead(tenantId: string, id: string) {
  const lead = await prisma.lead.findFirst({ where: { id, tenantId } });
  if (!lead) throw new Error("Lead tidak ditemukan.");

  return prisma.lead.delete({ where: { id } });
}
