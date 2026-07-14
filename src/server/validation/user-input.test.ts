import { describe, expect, it } from "vitest";
import { validateCashierPin } from "./user-input";

describe("validateCashierPin", () => {
  it("allows an omitted PIN because it is optional", () => {
    expect(validateCashierPin(undefined)).toBeUndefined();
  });

  it("allows exactly six numeric digits", () => {
    expect(validateCashierPin("123456")).toBeUndefined();
  });

  it.each(["12345", "1234567", "12ab56", " 123456", "123456 "])("rejects invalid PIN %j", (pin) => {
    expect(validateCashierPin(pin)).toBe("PIN kasir harus terdiri dari 6 angka.");
  });
});
