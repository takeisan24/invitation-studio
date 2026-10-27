import type { InvitationConfig, QuestionBlock } from "./date-content";
import { BASELINE_V1 } from "./invite-baseline";

// Invite configs arrive from URLs and request bodies, so every field is untrusted.
const MAX_STRING = 2000;
const MAX_NAME = 80;
const MAX_ARRAY = 30;
const MAX_QUESTIONS = 20;
const MAX_DEPTH = 6;

const QUESTION_TYPES = new Set(["course_card", "tag_pills", "short_text", "long_text"]);
const COLOR_RE = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\))$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Hosts allowed to serve invite music: our Blob store and the curated BGM CDN.
const MUSIC_HOST_RE = /(^|\.)public\.blob\.vercel-storage\.com$|^assets\.mixkit\.co$/;

function clamp(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return undefined;
  if (typeof value === "string") return value.slice(0, MAX_STRING);
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value
      .slice(0, MAX_ARRAY)
      .map((v) => clamp(v, depth + 1))
      .filter((v) => v !== undefined);
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      const c = clamp(v, depth + 1);
      if (c !== undefined) out[k] = c;
    }
    return out;
  }
  return undefined;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function httpsUrl(value: unknown): URL | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function isValidQuestion(q: unknown): q is QuestionBlock {
  return (
    isPlainObject(q) &&
    typeof q.id === "string" &&
    typeof q.title === "string" &&
    typeof q.type === "string" &&
    QUESTION_TYPES.has(q.type) &&
    (q.options === undefined ||
      (Array.isArray(q.options) &&
        q.options.every((o) => isPlainObject(o) && typeof o.title === "string")))
  );
}

/**
 * Normalizes an untrusted invite config: fills missing sections from the baseline,
 * clamps sizes, and drops values that could load unsafe content. Returns null when
 * the input is not an object at all.
 */
export function sanitizeInviteConfig(input: unknown): InvitationConfig | null {
  const raw = clamp(input);
  if (!isPlainObject(raw)) return null;

  const language = raw.language === "en" ? "en" : "vi";
  const base = BASELINE_V1[language];

  const config = {
    ...base,
    ...raw,
    language,
    cover: { ...base.cover, ...(isPlainObject(raw.cover) ? raw.cover : {}) },
    stepTicket: { ...base.stepTicket, ...(isPlainObject(raw.stepTicket) ? raw.stepTicket : {}) },
  } as InvitationConfig;

  config.guestName = typeof raw.guestName === "string" ? raw.guestName.slice(0, MAX_NAME) : base.guestName;
  config.senderName =
    typeof raw.senderName === "string" ? raw.senderName.slice(0, MAX_NAME) : base.senderName;
  if (typeof config.themeId !== "string") config.themeId = base.themeId;

  config.questions = (Array.isArray(raw.questions) ? raw.questions : base.questions)
    .filter(isValidQuestion)
    .slice(0, MAX_QUESTIONS);

  if (config.eventDate !== undefined && !(typeof config.eventDate === "string" && DATE_RE.test(config.eventDate))) {
    delete config.eventDate;
  }

  const opacity = config.backgroundOverlayOpacity;
  if (opacity !== undefined && !(typeof opacity === "number" && opacity >= 0 && opacity <= 1)) {
    delete config.backgroundOverlayOpacity;
  }

  // Senders may paste any image URL; only plain https is allowed so nothing
  // like javascript: or data: reaches a CSS url().
  if (config.backgroundImage !== undefined && !httpsUrl(config.backgroundImage)) {
    delete config.backgroundImage;
  }

  if (config.customPalette !== undefined) {
    const palette = config.customPalette as unknown;
    const valid =
      isPlainObject(palette) &&
      Object.values(palette).every((c) => typeof c === "string" && COLOR_RE.test(c.trim()));
    if (!valid) delete config.customPalette;
  }

  if (config.music !== undefined) {
    const music = config.music as unknown;
    if (!isPlainObject(music) || typeof music.trackId !== "string" || typeof music.title !== "string") {
      delete config.music;
    } else if (music.url !== undefined) {
      const url = httpsUrl(music.url);
      if (!url || !MUSIC_HOST_RE.test(url.hostname)) {
        if (music.trackId === "custom") delete config.music;
        else delete (config.music as { url?: string }).url;
      }
    }
  }

  return config;
}
