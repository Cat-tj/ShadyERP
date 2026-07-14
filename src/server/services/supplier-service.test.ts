import { beforeEach, describe, expect, it, vi } from "vitest";

const supplierModel = vi.hoisted(() => ({
  create: vi.fn(),
  updateMany: vi.fn(),
  findFirst: vi.fn(),
  findFirstOrThrow: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    supplier: supplierModel,
    purchaseOrder: { count: vi.fn(), aggregate: vi.fn() },
  },
}));

import { updateSupplier } from "./supplier-service";

describe("updateSupplier tenant isolation", () => {
  beforeEach(() => {
    supplierModel.updateMany.mockReset();
    supplierModel.findFirstOrThrow.mockReset();
  });

  it("updates only the supplier belonging to the caller tenant", async () => {
    supplierModel.updateMany.mockResolvedValue({ count: 1 });
    supplierModel.findFirstOrThrow.mockResolvedValue({ id: "supplier-a", tenantId: "tenant-a", name: "Baru" });

    await updateSupplier("tenant-a", "supplier-a", { name: "Baru" });

    expect(supplierModel.updateMany).toHaveBeenCalledWith({
      where: { id: "supplier-a", tenantId: "tenant-a" },
      data: { name: "Baru" },
    });
    expect(supplierModel.findFirstOrThrow).toHaveBeenCalledWith({
      where: { id: "supplier-a", tenantId: "tenant-a" },
    });
  });

  it("rejects an ID from a different tenant without changing ownership", async () => {
    supplierModel.updateMany.mockResolvedValue({ count: 0 });

    await expect(updateSupplier("tenant-a", "supplier-b", { name: "Tidak boleh berubah" })).rejects.toThrow(
      "Supplier tidak ditemukan"
    );

    expect(supplierModel.findFirstOrThrow).not.toHaveBeenCalled();
  });
});
