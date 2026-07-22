import { redirect } from "next/navigation";

// Backward compatibility: konten ini sudah dipindah ke /inventory/riwayat-stok.
export default function ProdukRiwayatStokRedirect() {
  redirect("/inventory/riwayat-stok");
}
