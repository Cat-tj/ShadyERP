"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/require-session";
import { postJournalEntry } from "@/server/services/accounting-service";

export async function recordSupplierPaymentAction(payload: {
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  try {
    const invoice = await prisma.supplierInvoice.findFirst({
      where: { id: payload.invoiceId, tenantId: user.tenantId },
    });

    if (!invoice) {
      return { succeeded: false, message: "Tagihan supplier tidak ditemukan." };
    }

    const remaining = invoice.total - invoice.paidAmount;
    if (payload.amount <= 0 || payload.amount > remaining) {
      return { succeeded: false, message: `Jumlah pembayaran harus antara 1 dan Rp ${remaining.toLocaleString()}` };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Create SupplierPayment
      const supplierPayment = await tx.supplierPayment.create({
        data: {
          tenantId: user.tenantId,
          supplierInvoiceId: payload.invoiceId,
          paymentDate: new Date(),
          amount: payload.amount,
          paymentMethod: payload.paymentMethod,
          notes: payload.notes || null,
        },
      });

      // 2. Update SupplierInvoice paid amount and status
      const newPaidAmount = invoice.paidAmount + payload.amount;
      const newStatus = newPaidAmount >= invoice.total ? "PAID" : "PARTIAL";

      await tx.supplierInvoice.update({
        where: { id: payload.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });

      // 3. Post automatically to accounting journal
      // Debet Accounts Payable (Hutang), Kredit Cash Drawer / Bank
      const creditCode = payload.paymentMethod === "CASH" ? "11100" : "11200"; // Cash vs Bank
      await postJournalEntry({
        tenantId: user.tenantId,
        description: `Pembayaran supplier ${invoice.invoiceNumber}`,
        debitCode: "21100",
        creditCode,
        amount: payload.amount,
        reference: `SUP-PAY-${supplierPayment.id}`,
        tx,
      });
    });

    revalidatePath("/finance/hutang-supplier");
    return { succeeded: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan internal.";
    return { succeeded: false, message: msg };
  }
}

export async function createManualSupplierInvoiceAction(payload: {
  supplierId: string;
  invoiceNumber: string;
  invoiceDateStr: string;
  dueDateStr?: string;
  total: number;
  notes?: string;
}) {
  const user = await requireRole(["OWNER", "MANAGER"]);

  try {
    const invoiceDate = new Date(payload.invoiceDateStr);
    const dueDate = payload.dueDateStr ? new Date(payload.dueDateStr) : null;

    const invoice = await prisma.supplierInvoice.create({
      data: {
        tenantId: user.tenantId,
        supplierId: payload.supplierId,
        invoiceNumber: payload.invoiceNumber,
        invoiceDate,
        dueDate,
        subtotal: payload.total,
        total: payload.total,
        status: "UNPAID",
        notes: payload.notes || null,
      },
    });

    // Post to accounting journal: Debet Expense/Inventory, Kredit Accounts Payable (Hutang)
    await postJournalEntry({
      tenantId: user.tenantId,
      description: `Tagihan supplier ${payload.invoiceNumber}`,
      debitCode: "51200",
      creditCode: "21100",
      amount: payload.total,
      reference: `SUP-INV-${invoice.id}`,
    });

    revalidatePath("/finance/hutang-supplier");
    return { succeeded: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Terjadi kesalahan internal.";
    return { succeeded: false, message: msg };
  }
}
