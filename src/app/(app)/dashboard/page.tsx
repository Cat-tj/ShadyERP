import { redirect } from "next/navigation";

// Backward compatibility: old bookmarked /dashboard links now land on the hub picker.
export default function DashboardRedirect() {
  redirect("/pilih-aplikasi");
}
