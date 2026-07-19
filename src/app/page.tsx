import { headers } from "next/headers";
import type { Metadata } from "next";
import { VERTICAL_MAP, type VerticalKey } from "@/lib/verticals";
import {
  getLandingCanonical,
  getLandingSeo,
} from "@/lib/landing/vertical-content";
import { LandingContent } from "@/components/landing/landing-content";
import "./landing.css";
import "./vertical-landing.css";

async function getLandingContext() {
  const headerList = await headers();
  const verticalKey = headerList.get("x-altora-vertical") as VerticalKey | null;
  const vertical = verticalKey ? VERTICAL_MAP[verticalKey] : undefined;
  return { vertical };
}

export async function generateMetadata(): Promise<Metadata> {
  const { vertical } = await getLandingContext();
  const seo = getLandingSeo(vertical);
  const canonical = getLandingCanonical(vertical);

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      type: "website",
      locale: "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
    },
  };
}

export default async function RootPage() {
  const { vertical } = await getLandingContext();
  const seo = getLandingSeo(vertical);
  const canonical = getLandingCanonical(vertical);

  return (
    <>
      <LandingContent vertical={vertical} faqItems={seo.faqs} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: seo.faqs.map((item) => ({
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
              url: canonical,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description: seo.description,
              featureList: vertical?.modules ?? [
                "kasir",
                "stok",
                "keuangan",
                "operasional",
              ],
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
