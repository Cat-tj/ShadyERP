import { requireModule } from "@/server/require-session";

export default async function LaundrySettingsLayout({ children }: { children: React.ReactNode }) {
  await requireModule("laundry");
  return children;
}
