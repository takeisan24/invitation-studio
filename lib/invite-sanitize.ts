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

// Custom invite music and background images may only come from this project's Blob store;
// background images may also use the sample photos offered in the studio. Curated tracks other
// than the built-in synthesized one no longer exist (the old Mixkit links are dead), so old
// invites fall back to it.
const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";
const SAMPLE_IMAGE_HOST = "images.unsplash.com";
const UNSAFE_URL_CHARS = /[\s()'"\\;<>`{}|^\u0000-\u001f\u007f]/;
const DEFAULT_MUSIC: { trackId: "lofi-rhodes"; title: string; artist: string } = { trackId: "lofi-rhodes", title: "Vintage Lo-Fi Rhodes", artist: "Cuộc Hẹn Nhỏ Sessions" };

/** Host of this project's Blob store, set at build time; undefined in local dev. */
function projectBlobHost(): string | undefined {
  return process.env.NEXT_PUBLIC_BLOB_HOST?.toLowerCase() || undefined;
}

function isProjectBlobHost(host: string, blobHost = projectBlobHost()): boolean {
  return blobHost ? host === blobHost : host.endsWith(BLOB_HOST_SUFFIX);
}

/**
 * Plain https URL with default port, no credentials and none of the characters that could
 * break out of a CSS url() or attribute. Returns the normalized href, or null.
 */
function strictHttpsUrl(value: unknown): URL | null {
  if (typeof value !== "string" || UNSAFE_URL_CHARS.test(value)) return null;
  const url = httpsUrl(value);
  if (!url || url.port !== "" || url.username || url.password || UNSAFE_URL_CHARS.test(url.href)) return null;
  return url;
}

/** Normalized href when the URL is an allowed background image, else null. */
export function allowedBackgroundImage(value: unknown, blobHost = projectBlobHost()): string | null {
  const url = strictHttpsUrl(value);
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  return host === SAMPLE_IMAGE_HOST || isProjectBlobHost(host, blobHost) ? url.href : null;
}

export function isAllowedBackgroundImage(value: unknown, blobHost = projectBlobHost()): boolean {
  return allowedBackgroundImage(value, blobHost) !== null;
}

/** Normalized href when the URL is allowed custom music, else null. */
export function allowedMusicUrl(value: unknown, blobHost = projectBlobHost()): string | null {
  const url = strictHttpsUrl(value);
  return url && isProjectBlobHost(url.hostname.toLowerCase(), blobHost) ? url.href : null;
}

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

  if (config.backgroundImage !== undefined) {
    const href = allowedBackgroundImage(config.backgroundImage);
    if (href) config.backgroundImage = href;
    else delete config.backgroundImage;
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
    } else if (music.trackId !== "custom") {
      config.music = { ...DEFAULT_MUSIC };
    } else {
      const href = allowedMusicUrl(music.url);
      if (href) config.music = { ...(music as unknown as NonNullable<InvitationConfig["music"]>), url: href };
      else delete config.music;
    }
  }

  return config;
}
