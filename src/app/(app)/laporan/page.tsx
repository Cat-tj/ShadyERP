import { redirect } from "next/navigation";

// Backward compatibility: redirect old laporan path to new finance/laporan path
export default function LaporanRedirect() {
  redirect("/finance/laporan");
}
