import type { ElementType, ComponentPropsWithoutRef } from "react";

/**
 * Permukaan "melayang" bergaya glassmorphism terkendali.
 * HANYA untuk: sidebar/topbar, bottom sheet, modal/dialog, kartu ringkasan,
 * dan kartu portal pelanggan. Jangan pakai di grid produk kasir, tabel, atau struk.
 */
export function GlassPanel<T extends ElementType = "div">({
  as,
  strong = false,
  className = "",
  children,
  ...props
}: {
  as?: T;
  strong?: boolean;
  className?: string;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">) {
  const Tag = (as ?? "div") as ElementType;
  const surfaceClass = strong ? "glass-surface-strong" : "glass-surface";
  return (
    <Tag className={`${surfaceClass} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
