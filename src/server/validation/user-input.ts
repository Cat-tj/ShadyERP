/** Validate a new cashier PIN before it reaches credential storage. */
export function validateCashierPin(pin: string | undefined): string | undefined {
  if (pin && !/^\d{6}$/.test(pin)) {
    return "PIN kasir harus terdiri dari 6 angka.";
  }
  return undefined;
}
