import { redirect } from "next/navigation";

// Backward compatibility: konten ini sudah dipindah ke /inventory/transfer-stok.
export default function ProdukTransferStokRedirect() {
  redirect("/inventory/transfer-stok");
}
