import { requireRole } from "@/server/require-session";
import { listGiftCards } from "@/server/services/gift-card-service";
import { VoucherManager } from "@/components/voucher/voucher-manager";

export default async function VoucherPage() {
  const user = await requireRole(["OWNER", "MANAGER", "STAFF"]);
  const giftCards = await listGiftCards(user.tenantId, 50);

  return (
    <VoucherManager
      canVoid={user.role === "OWNER" || user.role === "MANAGER"}
      giftCards={giftCards.map((gc) => ({
        id: gc.id,
        code: gc.code,
        initialValue: gc.initialValue,
        balance: gc.balance,
        status: gc.status,
        buyerName: gc.buyerName,
        buyerPhone: gc.buyerPhone,
        soldByName: gc.soldBy.name,
        createdAt: gc.createdAt.toISOString(),
      }))}
    />
  );
}
