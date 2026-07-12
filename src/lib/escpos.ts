/**
 * Builder perintah ESC/POS untuk printer thermal 58/80mm — dipakai lewat
 * aplikasi RawBT (Android) yang menerima raw byte via skema URL "rawbt:".
 * Standar ESC/POS ini didukung hampir semua printer thermal murah
 * (EPSON-compatible), tapi belum bisa dites di printer fisik sungguhan di
 * sini — kalau struk hasil cetak berantakan, sesuaikan urutan/kode di bawah.
 */

const ESC = 0x1b;
const GS = 0x1d;

class ReceiptBuilder {
  private bytes: number[] = [];

  private push(...values: number[]) {
    this.bytes.push(...values);
    return this;
  }

  init() {
    return this.push(ESC, 0x40); // ESC @ — reset printer
  }

  align(mode: "left" | "center" | "right") {
    const n = mode === "left" ? 0 : mode === "center" ? 1 : 2;
    return this.push(ESC, 0x61, n); // ESC a n
  }

  bold(on: boolean) {
    return this.push(ESC, 0x45, on ? 1 : 0); // ESC E n
  }

  doubleSize(on: boolean) {
    return this.push(GS, 0x21, on ? 0x11 : 0x00); // GS ! n — double width+height
  }

  text(line: string) {
    const bytes = Array.from(Buffer.from(line + "\n", "utf8"));
    return this.push(...bytes);
  }

  divider(char = "-", width = 32) {
    return this.text(char.repeat(width));
  }

  feed(lines = 1) {
    return this.push(ESC, 0x64, lines); // ESC d n
  }

  cut() {
    return this.push(GS, 0x56, 66, 0); // GS V 66 0 — full cut (feed then cut)
  }

  toUint8Array(): Uint8Array {
    return Uint8Array.from(this.bytes);
  }
}

export type ReceiptData = {
  tenantName: string;
  outletName: string;
  invoiceNumber: string;
  dateLabel: string;
  cashierName: string;
  memberName: string | null;
  orderType: string;
  items: { name: string; qty: number; price: number; subtotal: number }[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  changeAmount: number;
  /** Isi kalau transaksi split payment — dicetak sebagai baris per metode, gantiin paymentMethod/amountPaid. */
  payments?: { label: string; amount: number }[];
  footerNote: string | null;
  /** Lebar kertas printer dalam mm (58 atau 80) — pengaruh ke jumlah kolom karakter. Default 58. */
  paperWidth?: number;
};

/** Byte UTF-8, bukan JS string length (`.length` = UTF-16 code unit) — nama produk berkarakter non-ASCII bisa lebih dari 1 byte per karakter, jadi kolom bisa geser kalau dihitung pakai `.length`. */
function byteLength(text: string): number {
  return Buffer.byteLength(text, "utf8");
}

/** Potong per-karakter (bukan per-byte) supaya gak motong di tengah karakter multi-byte. */
function truncateToByteWidth(text: string, width: number): string {
  let result = "";
  let currentBytes = 0;
  for (const char of text) {
    const charBytes = byteLength(char);
    if (currentBytes + charBytes > width) break;
    result += char;
    currentBytes += charBytes;
  }
  return result;
}

function padRight(text: string, width: number): string {
  const len = byteLength(text);
  if (len >= width) return truncateToByteWidth(text, width);
  return text + " ".repeat(width - len);
}

function formatMoney(amount: number): string {
  return amount.toLocaleString("id-ID");
}

/** 58mm ~32 kolom, 80mm ~42 kolom di font default (font A) printer thermal umum. */
function resolveLineWidth(paperWidth?: number): number {
  return paperWidth === 80 ? 42 : 32;
}

export function buildReceiptEscPos(data: ReceiptData): Uint8Array {
  const LINE_WIDTH = resolveLineWidth(data.paperWidth);
  const r = new ReceiptBuilder();
  r.init();

  r.align("center");
  r.doubleSize(true);
  r.bold(true);
  r.text(data.tenantName);
  r.doubleSize(false);
  r.bold(false);
  r.text(data.outletName);
  r.feed(1);

  r.align("left");
  r.text(`No: ${data.invoiceNumber}`);
  r.text(data.dateLabel);
  r.text(`Kasir: ${data.cashierName}`);
  r.text(`Order: ${data.orderType}`);
  if (data.memberName) r.text(`Member: ${data.memberName}`);
  r.divider("-", LINE_WIDTH);

  for (const item of data.items) {
    r.text(item.name);
    const qtyPrice = `${item.qty} x ${formatMoney(item.price)}`;
    const subtotal = formatMoney(item.subtotal);
    r.text(padRight(qtyPrice, LINE_WIDTH - subtotal.length) + subtotal);
  }
  r.divider("-", LINE_WIDTH);

  const totalsRow = (label: string, value: string) => padRight(label, LINE_WIDTH - value.length) + value;
  r.text(totalsRow("Subtotal", formatMoney(data.subtotal)));
  if (data.discountAmount > 0) r.text(totalsRow("Diskon", `-${formatMoney(data.discountAmount)}`));
  if (data.taxAmount > 0) r.text(totalsRow("Pajak", formatMoney(data.taxAmount)));
  r.bold(true);
  r.text(totalsRow("TOTAL", formatMoney(data.total)));
  r.bold(false);
  if (data.payments && data.payments.length > 0) {
    for (const payment of data.payments) {
      r.text(totalsRow(payment.label, formatMoney(payment.amount)));
    }
  } else {
    r.text(totalsRow(data.paymentMethod, formatMoney(data.amountPaid)));
    if (data.changeAmount > 0) r.text(totalsRow("Kembalian", formatMoney(data.changeAmount)));
  }

  if (data.footerNote) {
    r.feed(1);
    r.align("center");
    r.text(data.footerNote);
  }

  r.feed(3);
  r.cut();

  return r.toUint8Array();
}

export function escPosToRawBtUrl(bytes: Uint8Array): string {
  const base64 = Buffer.from(bytes).toString("base64");
  return `rawbt:base64,${base64}`;
}
