import { NextResponse, type NextRequest } from "next/server";

/**
 * Light request checks for the write endpoints: same-origin only, plus a small
 * per-client cap kept in instance memory (each serverless instance counts on its own).
 */

export interface RateLimitRule {
  /** Separate counters per endpoint family. */
  bucket: string;
  limit: number;
  windowMs: number;
}

const hits = new Map<string, number[]>();
const MAX_TRACKED_KEYS = 5000;

function firstHeader(req: Pick<NextRequest, "headers">, name: string): string | null {
  const value = req.headers.get(name);
  return value ? value.split(",")[0].trim() : null;
}

/** Groups IPv6 addresses by their /64 so one network cannot use many addresses. */
function normalizeIp(ip: string): string {
  if (!ip.includes(":") || ip.includes(".")) return ip;
  const [head, tail = ""] = ip.toLowerCase().split("::");
  const front = head ? head.split(":") : [];
  const back = tail ? tail.split(":") : [];
  const groups = [...front, ...Array(Math.max(0, 8 - front.length - back.length)).fill("0"), ...back];
  return groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":") + "::/64";
}

export function clientIp(req: Pick<NextRequest, "headers">): string {
  const ip = firstHeader(req, "x-real-ip") ?? firstHeader(req, "x-forwarded-for");
  return ip ? normalizeIp(ip) : "local";
}

/**
 * True when the request may come from this site. A missing Origin (curl, old
 * browsers, server-to-server callbacks) passes; this layer only stops other web pages.
 * `next dev` is never blocked so LAN testing keeps working.
 */
export function isAllowedOrigin(
  req: Pick<NextRequest, "headers">,
  isDev = process.env.NODE_ENV !== "production"
): boolean {
  if (isDev) return true;

  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;

  const origin = req.headers.get("origin");
  if (!origin) return true;

  const host = firstHeader(req, "x-forwarded-host") ?? req.headers.get("host");
  try {
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Counts this request; returns seconds to wait when the caller is over the cap. */
export function rateLimitHit(ip: string, rule: RateLimitRule, now = Date.now()): number | null {
  const key = `${rule.bucket}:${ip}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < rule.windowMs);
  hits.delete(key); // re-inserted below so the Map stays ordered oldest-first

  if (recent.length >= rule.limit) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((recent[0] + rule.windowMs - now) / 1000));
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_TRACKED_KEYS) {
    for (const k of hits.keys()) {
      if (hits.size <= MAX_TRACKED_KEYS) break;
      hits.delete(k);
    }
  }
  return null;
}

export function resetRateLimits(): void {
  hits.clear();
}

export function forbiddenOrigin(): NextResponse {
  return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
}

export function rateLimited(req: Pick<NextRequest, "headers">, rule: RateLimitRule, extra: object = {}): NextResponse | null {
  const retryAfter = rateLimitHit(clientIp(req), rule);
  if (retryAfter === null) return null;
  return NextResponse.json({ error: "rate_limited", ...extra }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
}
