import { redirect } from "next/navigation";

// Backward compatibility: redirect old pengeluaran path to new finance/pengeluaran path
export default function PengeluaranRedirect() {
  redirect("/finance/pengeluaran");
}
