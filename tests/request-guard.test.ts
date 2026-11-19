import { beforeEach, describe, expect, it } from "vitest";
import { clientIp, isAllowedOrigin, rateLimitHit, resetRateLimits } from "@/lib/server/request-guard";

const req = (headers: Record<string, string>) => ({ headers: new Headers(headers) });
const rule = { bucket: "t", limit: 3, windowMs: 60_000 };

describe("isAllowedOrigin", () => {
  it("accepts a same-origin browser request", () => {
    expect(isAllowedOrigin(req({ host: "site.example", origin: "https://site.example", "sec-fetch-site": "same-origin" }), false)).toBe(true);
  });
  it("uses the forwarded host behind a proxy", () => {
    expect(isAllowedOrigin(req({ host: "internal", "x-forwarded-host": "site.example", origin: "https://site.example" }), false)).toBe(true);
  });
  it("rejects another site", () => {
    expect(isAllowedOrigin(req({ host: "site.example", origin: "https://other.example", "sec-fetch-site": "cross-site" }), false)).toBe(false);
  });
  it("rejects a mismatched Origin even without fetch metadata", () => {
    expect(isAllowedOrigin(req({ host: "site.example", origin: "https://other.example" }), false)).toBe(false);
  });
  it("rejects a malformed Origin", () => {
    expect(isAllowedOrigin(req({ host: "site.example", origin: "not a url" }), false)).toBe(false);
  });
  it("lets requests without Origin through (curl, old clients)", () => {
    expect(isAllowedOrigin(req({ host: "site.example" }), false)).toBe(true);
  });
  it("never blocks in dev, including LAN hosts", () => {
    expect(isAllowedOrigin(req({ host: "192.168.1.5:3000", origin: "http://other", "sec-fetch-site": "cross-site" }), true)).toBe(true);
  });
});

describe("rateLimitHit", () => {
  beforeEach(resetRateLimits);

  it("allows up to the limit then returns seconds to wait", () => {
    for (let i = 0; i < 3; i++) expect(rateLimitHit("1.1.1.1", rule, 1000)).toBeNull();
    expect(rateLimitHit("1.1.1.1", rule, 1000)).toBe(60);
  });
  it("tracks IPs and buckets separately", () => {
    for (let i = 0; i < 3; i++) rateLimitHit("1.1.1.1", rule, 1000);
    expect(rateLimitHit("2.2.2.2", rule, 1000)).toBeNull();
    expect(rateLimitHit("1.1.1.1", { ...rule, bucket: "other" }, 1000)).toBeNull();
  });
  it("frees up after the window", () => {
    for (let i = 0; i < 3; i++) rateLimitHit("1.1.1.1", rule, 1000);
    expect(rateLimitHit("1.1.1.1", rule, 1000 + 60_001)).toBeNull();
  });
});

describe("clientIp", () => {
  it("takes the first forwarded address", () => {
    expect(clientIp(req({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" }))).toBe("9.9.9.9");
  });
  it("falls back for local dev", () => {
    expect(clientIp(req({}))).toBe("local");
  });
});
