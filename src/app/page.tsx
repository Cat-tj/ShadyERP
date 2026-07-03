import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LandingContent } from "@/components/landing/landing-content";
import { LandingScripts } from "@/components/landing/landing-scripts";
import "./landing.css";

export default async function RootPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <>
      <LandingContent />
      <LandingScripts />
    </>
  );
}
