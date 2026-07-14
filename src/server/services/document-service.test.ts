import { beforeEach, describe, expect, it, vi } from "vitest";

const documentModel = vi.hoisted(() => ({ findFirst: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: { document: documentModel },
}));

import { getAccessibleDocumentById } from "./document-service";

describe("getAccessibleDocumentById", () => {
  beforeEach(() => documentModel.findFirst.mockReset());

  it("scopes both tenant and user/role access in one query", async () => {
    documentModel.findFirst.mockResolvedValue(null);

    await getAccessibleDocumentById("tenant-a", "document-b", "user-a", "STAFF");

    expect(documentModel.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "document-b",
          tenantId: "tenant-a",
          OR: [
            { uploadedBy: "user-a" },
            { signers: { some: { userId: "user-a" } } },
            { accessControl: { some: { OR: [{ userId: "user-a" }, { role: "STAFF" }] } } },
          ],
        }),
      })
    );
  });

  it("does not treat a same-tenant user as authorized without a matching rule", async () => {
    documentModel.findFirst.mockResolvedValue(null);

    const result = await getAccessibleDocumentById("tenant-a", "private-doc", "unassigned-user", "STAFF");

    expect(result).toBeNull();
  });
});
