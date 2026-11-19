import { NextResponse, type NextRequest } from "next/server";

/**
 * Light request checks for the write endpoints: same-origin only, plus a small
 * per-IP cap kept in instance memory. The cap is a shock absorber, not a limit
 * (serverless instances do not share memory); a Vercel Firewall rule is the real one.
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

export function clientIp(req: Pick<NextRequest, "headers">): string {
  return firstHeader(req, "x-forwarded-for") ?? firstHeader(req, "x-real-ip") ?? "local";
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

  if (recent.length >= rule.limit) {
    hits.set(key, recent);
    return Math.max(1, Math.ceil((recent[0] + rule.windowMs - now) / 1000));
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_TRACKED_KEYS) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= rule.windowMs)) hits.delete(k);
    }
    if (hits.size > MAX_TRACKED_KEYS) hits.clear();
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
