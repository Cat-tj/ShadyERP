import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LandingContent } from "@/components/landing/landing-content";
import { LandingScripts } from "@/components/landing/landing-scripts";
import { VERTICAL_MAP, type VerticalKey } from "@/lib/verticals";
import "./landing.css";

export default async function RootPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/pilih-aplikasi");
  }

  const headerList = await headers();
  const verticalKey = headerList.get("x-altora-vertical") as VerticalKey | null;
  const vertical = verticalKey ? VERTICAL_MAP[verticalKey] : undefined;

  return (
    <>
      <LandingContent vertical={vertical} />
      <LandingScripts />
    </>
  );
}
