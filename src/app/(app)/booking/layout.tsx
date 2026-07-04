import { requireModule } from "@/server/require-session";

export default async function BookingLayout({ children }: { children: React.ReactNode }) {
  await requireModule("booking");
  return <>{children}</>;
}
