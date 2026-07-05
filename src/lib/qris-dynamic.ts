const CRC_TAG = "6304";

function crc16Ccitt(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function removeTag(payload: string, targetTag: string) {
  let position = 0;
  let result = "";

  while (position < payload.length) {
    if (payload.length - position < 4) {
      break;
    }
    const tagStart = position;
    const tag = payload.slice(position, position + 2);
    const rawLength = payload.slice(position + 2, position + 4);
    const length = Number(rawLength);

    if (tag.length !== 2 || rawLength.length !== 2 || !Number.isInteger(length)) {
      throw new Error("Payload QRIS tidak valid.");
    }

    position += 4;
    const value = payload.slice(position, position + length);
    if (value.length !== length) {
      throw new Error("Payload QRIS tidak lengkap.");
    }
    position += length;

    if (tag !== targetTag) {
      result += payload.slice(tagStart, position);
    }
  }

  return result;
}

function normalizeAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Nominal QRIS tidak valid.");
  }
  return String(Math.round(amount));
}

export function buildDynamicQris(staticQris: string, amount: number) {
  const cleaned = staticQris.trim().replace(/\s+/g, "");
  if (!cleaned) throw new Error("QRIS statis belum diisi.");

  const crcPosition = cleaned.length - 8;
  if (crcPosition < 0 || cleaned.slice(crcPosition, crcPosition + 4) !== CRC_TAG) {
    throw new Error("QRIS statis tidak valid: tag CRC 63 tidak ditemukan di akhir payload.");
  }

  const withoutAmount = removeTag(cleaned, "54");
  const amountValue = normalizeAmount(amount);
  const amountTag = `54${amountValue.length.toString().padStart(2, "0")}${amountValue}`;
  const insertPosition = withoutAmount.length - 8;
  if (insertPosition < 0 || withoutAmount.slice(insertPosition, insertPosition + 4) !== CRC_TAG) {
    throw new Error("QRIS statis tidak valid: tag CRC 63 tidak ditemukan.");
  }

  const withAmount = `${withoutAmount.slice(0, insertPosition)}${amountTag}${withoutAmount.slice(insertPosition)}`;
  const payloadWithoutCrcValue = withAmount.slice(0, -4);
  return `${payloadWithoutCrcValue}${crc16Ccitt(payloadWithoutCrcValue)}`;
}
