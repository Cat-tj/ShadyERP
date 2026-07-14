import crypto from "crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let verifyWebhookSignature: typeof import("./sumopod-service").verifyWebhookSignature;

describe("verifyWebhookSignature", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("SUMOPOD_WEBHOOK_SECRET", "webhook-test-secret");
    ({ verifyWebhookSignature } = await import("./sumopod-service"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("accepts a fresh correctly signed payload", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T12:00:00Z"));
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = '{"order_id":"INV-1"}';
    const signature = crypto.createHmac("sha256", "webhook-test-secret").update(`${timestamp}.${body}`).digest("hex");

    expect(verifyWebhookSignature(body, signature, timestamp)).toBe(true);
  });

  it("rejects stale or malformed timestamps before accepting a signature", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T12:00:00Z"));
    expect(verifyWebhookSignature("{}", "invalid", "not-a-time")).toBe(false);
    expect(verifyWebhookSignature("{}", "invalid", String(Math.floor(Date.now() / 1000) - 301))).toBe(false);
  });
});
