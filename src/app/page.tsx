import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LandingContent } from "@/components/landing/landing-content";
import { VERTICAL_MAP, type VerticalKey } from "@/lib/verticals";
import { FAQ_ITEMS } from "@/lib/landing-data";
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ_ITEMS.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer,
                },
              })),
            },
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: vertical?.label ?? "Altora POS & ERP",
              url: "https://altora.my.id/",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                vertical?.lede ??
                "Kelola kasir, stok, pelanggan, hutang-piutang, dan laporan dalam satu aplikasi.",
              featureList: vertical?.modules ?? ["kasir", "stok", "keuangan", "operasional"],
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "IDR",
              },
              publisher: {
                "@type": "Organization",
                name: "Altora",
                url: "https://altora.my.id/",
              },
            },
          ]),
        }}
      />
    </>
  );
}
