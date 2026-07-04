import { redirect } from "next/navigation";

// Backward compatibility: redirect old dashboard path to new kpi path
export default function DashboardRedirect() {
  redirect("/kpi");
}
