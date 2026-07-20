import Image from "next/image";

/* Foto mockup device asli (bukan ilustrasi CSS) — satu foto tetap buat
   semua tab vertikal, karena foto sudah baked/statis (nggak bisa ganti
   konten kayak DeviceStage lama). Copy di sebelah kiri tetap ganti per
   vertikal seperti biasa. */
export function DeviceStagePhoto() {
  return (
    <div className="device-photo-stage">
      <div className="device-photo-laptop">
        <Image src="/landing-previews/showcase-laptop.png" alt="Tampilan Altora di laptop" width={1920} height={1080} sizes="(max-width: 860px) 100vw, 60vw" style={{ width: "100%", height: "auto" }} />
      </div>
      <div className="device-photo-side">
        <div className="device-photo-tablet">
          <Image src="/landing-previews/showcase-tablet.png" alt="Tampilan Altora di tablet" width={1080} height={1920} sizes="(max-width: 860px) 45vw, 22vw" style={{ width: "100%", height: "auto" }} />
        </div>
        <div className="device-photo-phone">
          <Image src="/landing-previews/showcase-phone.png" alt="Tampilan Altora di HP" width={1080} height={1920} sizes="(max-width: 860px) 32vw, 15vw" style={{ width: "100%", height: "auto" }} />
        </div>
      </div>
    </div>
  );
}
