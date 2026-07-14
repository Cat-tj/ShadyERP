import { describe, expect, it } from "vitest";
import { getMissingRuntimeConfig } from "./runtime-config";

describe("getMissingRuntimeConfig", () => {
  it("reports names, not values, for missing runtime configuration", () => {
    expect(getMissingRuntimeConfig({ DATABASE_URL: "postgres://safe", AUTH_SECRET: "" })).toEqual(["AUTH_SECRET"]);
  });

  it("accepts non-empty database and auth values", () => {
    expect(getMissingRuntimeConfig({ DATABASE_URL: "postgres://safe", AUTH_SECRET: "safe" })).toEqual([]);
  });
});
