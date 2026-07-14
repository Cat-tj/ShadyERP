import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { createSale, getSaleById } from "@/server/services/sale-service";
import { openShift } from "@/server/services/shift-service";
import { getSupplierById, updateSupplier } from "@/server/services/supplier-service";

const runIntegration = process.env.RUN_INTEGRATION_TESTS === "true";
const describeIntegration = runIntegration ? describe : describe.skip;

type Fixture = { tenantId: string; outletId: string; userId: string; productId: string };
const createdTenantIds: string[] = [];

async function createFixture(label: string, stockQty = 10): Promise<Fixture> {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tenant = await prisma.tenant.create({
    data: { name: `Integration ${label}`, slug: `integration-${label}-${nonce}` },
  });
  createdTenantIds.push(tenant.id);
  const outlet = await prisma.outlet.create({ data: { tenantId: tenant.id, name: `Outlet ${label}` } });
  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: `Cashier ${label}`,
      email: `cashier-${label}-${nonce}@integration.altora.test`,
      passwordHash: "integration-only",
      role: "STAFF",
    },
  });
  const product = await prisma.product.create({
    data: { tenantId: tenant.id, name: `Produk ${label}`, price: 10_000, cost: 5_000, trackStock: true },
  });
  await prisma.productStock.create({
    data: { tenantId: tenant.id, productId: product.id, outletId: outlet.id, qty: stockQty },
  });
  return { tenantId: tenant.id, outletId: outlet.id, userId: user.id, productId: product.id };
}

function checkoutInput(fixture: Fixture, idempotencyKey: string) {
  return {
    tenantId: fixture.tenantId,
    outletId: fixture.outletId,
    cashierId: fixture.userId,
    items: [{ productId: fixture.productId, qty: 1, discountAmount: 0 }],
    discountAmount: 0,
    paymentMethod: "CASH" as const,
    amountPaid: 10_000,
    idempotencyKey,
  };
}

describeIntegration("ERP integrity against PostgreSQL", () => {
  it("enforces tenant boundaries for supplier and sale records", async () => {
    const tenantA = await createFixture("tenant-a");
    const tenantB = await createFixture("tenant-b");
    const supplier = await prisma.supplier.create({ data: { tenantId: tenantA.tenantId, name: "Supplier Tenant A" } });
    const sale = await createSale(checkoutInput(tenantA, `tenant-sale-${Date.now()}`));

    await expect(updateSupplier(tenantB.tenantId, supplier.id, { name: "Tidak boleh berubah" })).rejects.toThrow(
      "Supplier tidak ditemukan"
    );
    expect(await getSupplierById(tenantB.tenantId, supplier.id)).toBeNull();
    expect(await getSaleById(tenantB.tenantId, sale.id)).toBeNull();
  });

  it("accepts a retried checkout once and decrements stock once", async () => {
    const fixture = await createFixture("idempotency", 2);
    const key = `retry-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const [first, retry] = await Promise.all([createSale(checkoutInput(fixture, key)), createSale(checkoutInput(fixture, key))]);

    expect(first.id).toBe(retry.id);
    expect(await prisma.sale.count({ where: { tenantId: fixture.tenantId, idempotencyKey: key } })).toBe(1);
    expect(
      await prisma.productStock.findUniqueOrThrow({
        where: { productId_outletId: { productId: fixture.productId, outletId: fixture.outletId } },
      })
    ).toMatchObject({ qty: 1 });
  });

  it("does not allow concurrent sales to push stock below zero", async () => {
    const fixture = await createFixture("stock-race", 1);
    const [first, second] = await Promise.allSettled([
      createSale(checkoutInput(fixture, `stock-a-${Date.now()}`)),
      createSale(checkoutInput(fixture, `stock-b-${Date.now()}`)),
    ]);

    expect([first, second].filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect([first, second].filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(
      await prisma.productStock.findUniqueOrThrow({
        where: { productId_outletId: { productId: fixture.productId, outletId: fixture.outletId } },
      })
    ).toMatchObject({ qty: 0 });
  });

  it("permits at most one open shift per cashier", async () => {
    const fixture = await createFixture("shift-race");
    const [first, second] = await Promise.allSettled([
      openShift({ tenantId: fixture.tenantId, userId: fixture.userId, outletId: fixture.outletId, openingCash: 100_000 }),
      openShift({ tenantId: fixture.tenantId, userId: fixture.userId, outletId: fixture.outletId, openingCash: 100_000 }),
    ]);

    expect([first, second].filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect([first, second].filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(await prisma.cashierShift.count({ where: { tenantId: fixture.tenantId, userId: fixture.userId, status: "OPEN" } })).toBe(1);
  });
});

afterAll(async () => {
  if (createdTenantIds.length > 0) await prisma.tenant.deleteMany({ where: { id: { in: createdTenantIds } } });
  await prisma.$disconnect();
});
