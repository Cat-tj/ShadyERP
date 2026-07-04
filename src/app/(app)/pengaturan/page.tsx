import { redirect } from "next/navigation";

export default function PengaturanPage() {
  // Bukan /pengaturan/karyawan: tab itu ke-gate modul HR, jadi kalau HR mati
  // Owner nggak akan pernah bisa masuk /pengaturan sama sekali. /bisnis
  // netral, tidak terikat modul manapun, jadi selalu bisa diakses.
  redirect("/pengaturan/bisnis");
}
