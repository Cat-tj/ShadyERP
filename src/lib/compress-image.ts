/** Kompres foto dari input file jadi data URL kecil (maks lebar 480px) sebelum dikirim ke server. */
export function compressImageFile(file: File, maxWidth = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file foto."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat foto."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Kanvas tidak didukung di perangkat ini."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
