"use server";

import { requireRole } from "@/server/require-session";
import { findSerial } from "@/server/services/product-serial-service";

export type SerialLookupResult = {
  serialNumber: string;
  productName: string;
  status: "IN_STOCK" | "SOLD";
  outletName: string;
  soldAt: string | null;
  saleInvoiceNumber: string | null;
  saleOutletName: string | null;
  cashierName: string | null;
} | null;

export async function findSerialAction(serialNumber: string): Promise<SerialLookupResult> {
  const user = await requireRole(["OWNER", "MANAGER", "STAFF"]);
  const trimmed = serialNumber.trim();
  if (!trimmed) return null;

  const serial = await findSerial(user.tenantId, trimmed);
  if (!serial) return null;

  return {
    serialNumber: serial.serialNumber,
    productName: serial.product.name,
    status: serial.status,
    outletName: serial.outlet.name,
    soldAt: serial.soldAt ? serial.soldAt.toISOString() : null,
    saleInvoiceNumber: serial.saleItem?.sale.invoiceNumber ?? null,
    saleOutletName: serial.saleItem?.sale.outlet.name ?? null,
    cashierName: serial.saleItem?.sale.cashier.name ?? null,
  };
}
