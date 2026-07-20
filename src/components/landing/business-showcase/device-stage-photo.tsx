import Image from "next/image";

/* Foto mockup device asli (background sudah dihapus, jadi bisa numpuk
   kayak komposisi .bs-stage lama) — satu foto tetap buat semua tab
   vertikal, karena foto sudah baked/statis (nggak bisa ganti konten
   kayak DeviceStage lama). Copy di sebelah kiri tetap ganti per
   vertikal seperti biasa.
   Posisi left/top/width % di CSS niru proporsi .bs-stage lama
   (laptop 0,0,78.1% / tablet 66.25%,17.14%,25.49% / phone
   86.45%,44.93%,13.55%), disesuaikan ke aspect-ratio foto asli. */
export function DeviceStagePhoto() {
  return (
    <div className="device-photo-stage">
      <div className="device-photo-laptop">
        <Image src="/landing-previews/showcase-laptop.png" alt="Tampilan Altora di laptop" width={1788} height={1069} sizes="(max-width: 860px) 100vw, 60vw" style={{ width: "100%", height: "auto" }} />
      </div>
      <div className="device-photo-tablet">
        <Image src="/landing-previews/showcase-tablet.png" alt="Tampilan Altora di tablet" width={1080} height={1642} sizes="(max-width: 860px) 30vw, 18vw" style={{ width: "100%", height: "auto" }} />
      </div>
      <div className="device-photo-phone">
        <Image src="/landing-previews/showcase-phone.png" alt="Tampilan Altora di HP" width={942} height={1920} sizes="(max-width: 860px) 18vw, 10vw" style={{ width: "100%", height: "auto" }} />
      </div>
    </div>
  );
}
