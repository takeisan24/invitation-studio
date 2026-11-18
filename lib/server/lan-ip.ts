import os from "node:os";

/**
 * LAN address of the dev machine, so the studio can show a Wi-Fi link that phones
 * on the same network can open. Development only: on a server it would leak the
 * host's private address.
 */
export function devLanIp(): string | null {
  if (process.env.NODE_ENV !== "development") return null;
  try {
    for (const list of Object.values(os.networkInterfaces())) {
      for (const net of list || []) {
        if (net.family === "IPv4" && !net.internal && /^(192\.168\.|10\.|172\.)/.test(net.address)) {
          return net.address;
        }
      }
    }
  } catch {
    // No interfaces readable; the studio just hides the Wi-Fi toggle.
  }
  return null;
}
