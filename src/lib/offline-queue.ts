"use client";

import type { CreateSalePayload, CreateSaleResult } from "@/app/(app)/kasir/actions";

/**
 * Antrian transaksi offline pakai IndexedDB langsung (tanpa library) — kasir
 * tetap bisa menyelesaikan penjualan saat internet putus, transaksinya
 * disimpan lokal dulu lalu dikirim ke server begitu online lagi.
 *
 * PENTING soal stok: reservasi stok atomik (lihat sale-service.ts) hanya bisa
 * dijamin akurat kalau ada koneksi live ke database. Selagi offline, cek stok
 * di kasir cuma pakai data terakhir yang sempat dimuat (bisa basi). Karena
 * itu, transaksi offline TIDAK langsung dianggap sukses begitu tersimpan
 * lokal — statusnya "queued" sampai berhasil dikirim & lolos pengecekan stok
 * di server. Kalau ternyata stoknya sudah habis duluan (dipakai transaksi
 * lain selama offline), sinkronnya gagal dan kasir harus selesaikan manual
 * (lihat OfflineSyncBanner) — bukan dipaksa sukses begitu saja.
 */

const DB_NAME = "altora-offline-pos";
const DB_VERSION = 1;
const STORE_NAME = "queued-sales";

export type QueuedSale = {
  id: string;
  payload: CreateSalePayload;
  createdAt: string;
  lastError: string | null;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const request = fn(tx.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function queueSale(payload: CreateSalePayload): Promise<QueuedSale> {
  const entry: QueuedSale = {
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    payload,
    createdAt: new Date().toISOString(),
    lastError: null,
  };
  await withStore("readwrite", (store) => store.add(entry));
  return entry;
}

export async function listQueuedSales(): Promise<QueuedSale[]> {
  const result = await withStore<QueuedSale[]>("readonly", (store) => store.getAll());
  return result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeQueuedSale(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}

export async function markQueuedSaleError(id: string, error: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const entry = getRequest.result as QueuedSale | undefined;
      if (entry) {
        entry.lastError = error;
        store.put(entry);
      }
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Kirim semua transaksi yang mengantre ke server satu-satu (urut sesuai
 * waktu dibuat). Yang sukses langsung dihapus dari antrian; yang gagal
 * (mis. stok sudah habis) tetap di antrian dengan catatan errornya supaya
 * kasir bisa lihat & selesaikan manual.
 */
export async function flushQueue(
  createSaleAction: (payload: CreateSalePayload) => Promise<CreateSaleResult>
): Promise<{ succeeded: number; failed: number }> {
  const queued = await listQueuedSales();
  let succeeded = 0;
  let failed = 0;

  for (const entry of queued) {
    try {
      const result = await createSaleAction(entry.payload);
      if (result.error) {
        await markQueuedSaleError(entry.id, result.error);
        failed += 1;
      } else {
        await removeQueuedSale(entry.id);
        succeeded += 1;
      }
    } catch {
      // Masih offline atau server tidak terjangkau — hentikan, coba lagi nanti.
      break;
    }
  }

  return { succeeded, failed };
}
