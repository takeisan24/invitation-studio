import LZString from "lz-string";
import {
  InvitationConfig,
  defaultInvitationConfigVi,
  defaultInvitationConfigEn,
} from "./date-content";

/**
 * Encodes an InvitationConfig object into a compact, URL-safe compressed string using lz-string
 */
export function encodeConfigToUrl(config: InvitationConfig): string {
  try {
    const json = JSON.stringify(config);
    return LZString.compressToEncodedURIComponent(json);
  } catch (err) {
    console.error("Failed to encode configuration:", err);
    return "";
  }
}

/**
 * Decodes a URL parameter back into an InvitationConfig object.
 * Supports both modern LZString compressed format and legacy URL-safe Base64 strings.
 */
export function decodeConfigFromUrl(encoded: string): InvitationConfig | null {
  try {
    if (!encoded) return null;

    let json: string | null = null;

    // 1. Attempt decompression with LZString
    try {
      json = LZString.decompressFromEncodedURIComponent(encoded);
    } catch {
      json = null;
    }

    // 2. If LZString did not yield a valid JSON object string, fall back to legacy Base64
    if (!json || !json.trim().startsWith("{")) {
      try {
        let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4 !== 0) {
          base64 += "=";
        }

        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        json = new TextDecoder().decode(bytes);
      } catch {
        json = null;
      }
    }

    if (!json) return null;

    const parsed = JSON.parse(json);

    const baseConfig =
      parsed.language === "en" ? defaultInvitationConfigEn : defaultInvitationConfigVi;

    return {
      ...baseConfig,
      ...parsed,
      cover: {
        ...baseConfig.cover,
        ...(parsed.cover || {}),
      },
      questions: parsed.questions || baseConfig.questions,
      stepTicket: {
        ...baseConfig.stepTicket,
        ...(parsed.stepTicket || {}),
      },
    };
  } catch (err) {
    console.error("Failed to decode configuration from URL:", err);
    return null;
  }
}
