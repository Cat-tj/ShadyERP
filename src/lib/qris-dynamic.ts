const CRC_TAG = "6304";
const PAYLOAD_START = "000201";

type EmvTag = {
  tag: string;
  length: number;
  start: number;
  valueStart: number;
  end: number;
  value: string;
};

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

function parseTopLevelTags(payload: string) {
  let position = 0;
  const tags: EmvTag[] = [];

  while (position < payload.length) {
    if (payload.length - position < 4) {
      throw new Error("Payload QRIS memiliki sisa karakter yang tidak valid.");
    }

    const start = position;
    const tag = payload.slice(position, position + 2);
    const rawLength = payload.slice(position + 2, position + 4);

    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(rawLength)) {
      throw new Error("Payload QRIS tidak valid: format tag EMV salah.");
    }

    const length = Number(rawLength);
    const valueStart = position + 4;
    const end = valueStart + length;
    const value = payload.slice(valueStart, end);

    if (value.length !== length) {
      throw new Error("Payload QRIS tidak lengkap.");
    }

    tags.push({ tag, length, start, valueStart, end, value });
    position = end;

    if (tag === "63") {
      if (length !== 4) {
        throw new Error("QRIS statis tidak valid: panjang CRC harus 4 karakter.");
      }
      if (position !== payload.length) {
        throw new Error("Payload QRIS memiliki karakter tambahan setelah CRC.");
      }
      break;
    }
  }

  return tags;
}

function getCrcTag(tags: EmvTag[]) {
  const crcTag = tags.find((tag) => tag.tag === "63");
  if (!crcTag) {
    throw new Error("QRIS statis tidak valid: tag CRC 63 tidak ditemukan.");
  }
  return crcTag;
}

function trimAfterCrc(payload: string) {
  const crcIndex = payload.lastIndexOf(CRC_TAG);
  if (crcIndex < 0) {
    throw new Error("QRIS statis tidak valid: tag CRC 63 tidak ditemukan di akhir payload.");
  }

  const crcEnd = crcIndex + CRC_TAG.length + 4;
  if (crcEnd > payload.length) {
    throw new Error("QRIS statis tidak valid: nilai CRC tidak lengkap.");
  }

  return payload.slice(0, crcEnd);
}

function removeTag(payload: string, targetTag: string) {
  const tags = parseTopLevelTags(payload);
  let position = 0;
  let result = "";

  for (const tag of tags) {
    if (tag.tag !== targetTag) {
      result += payload.slice(position, tag.end);
    }
    position = tag.end;
  }

  return result;
}

function replaceTagValue(payload: string, targetTag: string, value: string) {
  const tag = parseTopLevelTags(payload).find((item) => item.tag === targetTag);
  if (!tag) return payload;

  const length = value.length.toString().padStart(2, "0");
  return `${payload.slice(0, tag.start)}${targetTag}${length}${value}${payload.slice(tag.end)}`;
}

function normalizeAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Nominal QRIS tidak valid.");
  }
  return String(Math.round(amount));
}

export function normalizeStaticQrisPayload(staticQris: string) {
  const cleaned = staticQris
    .replace(/^\uFEFF/, "")
    .trim()
    .replace(/[\r\n\t]/g, "");
  if (!cleaned) throw new Error("QRIS statis belum diisi.");

  const startIndex = cleaned.indexOf(PAYLOAD_START);
  if (startIndex < 0) {
    throw new Error("QRIS statis tidak valid: payload EMV QRIS tidak ditemukan.");
  }

  const payload = trimAfterCrc(cleaned.slice(startIndex));
  const tags = parseTopLevelTags(payload);
  const crcTag = getCrcTag(tags);
  const expectedCrc = crc16Ccitt(payload.slice(0, crcTag.valueStart)).toUpperCase();
  if (crcTag.value.toUpperCase() !== expectedCrc) {
    throw new Error("QRIS statis tidak valid: CRC tidak cocok. Coba scan ulang dengan gambar yang lebih jelas.");
  }

  return payload;
}

export function buildDynamicQris(staticQris: string, amount: number) {
  const cleaned = normalizeStaticQrisPayload(staticQris);
  const dynamicMethod = replaceTagValue(cleaned, "01", "12");
  const withoutAmount = removeTag(dynamicMethod, "54");
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
