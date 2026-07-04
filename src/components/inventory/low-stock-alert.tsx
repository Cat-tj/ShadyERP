"use client";

import { GlassPanel } from "@/components/ui/glass-panel";
import { AlertTriangleIcon } from "@/components/ui/icons";

interface LowStockItem {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  deficit: number;
}

interface LowStockAlertProps {
  items: LowStockItem[];
  isLoading?: boolean;
}

export function LowStockAlert({ items, isLoading }: LowStockAlertProps) {
  if (isLoading) {
    return <div className="text-center text-[var(--color-text-secondary)]">Loading...</div>;
  }

  if (!items || items.length === 0) {
    return (
      <GlassPanel className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
        <p className="text-sm text-green-600">✓ Semua produk stok aman</p>
      </GlassPanel>
    );
  }

  const criticalItems = items.filter((i) => i.currentStock === 0);
  const warningItems = items.filter((i) => i.currentStock > 0 && i.currentStock <= i.reorderPoint);

  return (
    <div className="space-y-3">
      {criticalItems.length > 0 && (
        <GlassPanel className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex gap-3">
            <AlertTriangleIcon className="h-5 w-5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-600">Stok Habis ({criticalItems.length})</p>
              <div className="mt-2 space-y-1">
                {criticalItems.map((item) => (
                  <p key={item.productId} className="text-xs text-red-600">
                    • {item.productName}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>
      )}

      {warningItems.length > 0 && (
        <GlassPanel className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
          <div className="flex gap-3">
            <AlertTriangleIcon className="h-5 w-5 shrink-0 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-600">Stok Menipis ({warningItems.length})</p>
              <div className="mt-2 space-y-1">
                {warningItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-xs text-yellow-600">
                    <span>{item.productName}</span>
                    <span>{item.currentStock} stok (butuh +{item.deficit})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
