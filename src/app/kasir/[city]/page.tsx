import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LandingContent } from "@/components/landing/landing-content";
import { LandingScripts } from "@/components/landing/landing-scripts";
import "../../landing.css";

// 50 Major Indonesian Cities for Programmatic SEO
export const CITIES = [
  "samarinda", "jakarta", "surabaya", "bandung", "medan", "semarang", "makassar",
  "palembang", "tangerang", "depok", "bekasi", "bogor", "batam", "pekanbaru",
  "bandar-lampung", "padang", "malang", "denpasar", "balikpapan", "pontianak",
  "banjarmasin", "manado", "yogyakarta", "surakarta", "cilegon", "serang",
  "purwokerto", "cirebon", "tasikmalaya", "sukabumi", "pekalongan", "tegal",
  "kediri", "jember", "banyuwangi", "mataram", "kupang", "palangkaraya",
  "tarakan", "kendari", "palu", "gorontalo", "ambon", "jayapura", "sorong",
  "banda-aceh", "jambi", "bengkulu", "pangkalpinang", "binjai"
];

export function generateStaticParams() {
  return CITIES.map((city) => ({
    city,
  }));
}

export async function generateMetadata({ params }: { params: { city: string } }) {
  const city = decodeURIComponent(params.city)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `Aplikasi Kasir POS & ERP Terbaik di ${city} — Altora`,
    description: `Cari aplikasi kasir POS dan ERP UMKM terbaik di ${city}? Altora adalah solusi aplikasi kasir gampang untuk kelola stok, karyawan, dan keuangan toko Anda.`,
    alternates: {
      canonical: `https://www.altora.my.id/kasir/${params.city}`,
    },
  };
}

export default async function CityLandingPage({ params }: { params: { city: string } }) {
  const session = await auth();
  if (session?.user) {
    redirect("/pilih-aplikasi");
  }

  // Verify that the requested city is in our allowed list, if not return 404
  if (!CITIES.includes(params.city.toLowerCase())) {
    redirect("/");
  }

  return (
    <>
      <LandingContent city={params.city} />
      <LandingScripts />
    </>
  );
}
