"use client";

import { useEffect, useState, useCallback } from "react";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 2500);
    return () => clearTimeout(timeout);
  }, [message]);

  const showToast = useCallback((text: string) => setMessage(text), []);

  return { toastMessage: message, showToast };
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-sm items-center justify-center rounded-lg bg-[var(--color-text)] px-4 py-3 text-center text-sm font-medium text-white shadow-lg md:bottom-6">
      {message}
    </div>
  );
}
