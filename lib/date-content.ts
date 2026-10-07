import { PaletteColors } from "./theme-config";

export type QuestionType = "course_card" | "tag_pills" | "short_text" | "long_text";

export interface QuestionOption {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

export interface QuestionBlock {
  id: string;
  type: QuestionType;
  title: string;
  subtitle?: string;
  options?: QuestionOption[];
  placeholder?: string;
  required?: boolean;
}

export interface MusicTrackConfig {
  trackId: "lofi-rhodes" | "cozy-piano" | "acoustic-romance" | "custom";
  title: string;
  artist?: string;
  url?: string;
}

export const CURATED_TRACKS: {
  id: "lofi-rhodes" | "cozy-piano" | "acoustic-romance";
  title: { vi: string; en: string };
  artist: string;
  desc: { vi: string; en: string };
  url?: string;
}[] = [
  {
    id: "lofi-rhodes",
    title: { vi: "Vintage Lo-Fi Rhodes", en: "Vintage Lo-Fi Rhodes" },
    artist: "Cuộc Hẹn Nhỏ Sessions",
    desc: {
      vi: "Piano điện Rhodes ấm áp, tiếng nổ đĩa than & nhịp trống chill",
      en: "Warm Rhodes piano, analog vinyl crackle & relaxed lo-fi groove",
    },
  },
  {
    id: "cozy-piano",
    title: { vi: "Midnight Café Jazz", en: "Midnight Café Jazz" },
    artist: "Acoustic Coffee Duo",
    desc: {
      vi: "Giai điệu piano jazz êm dịu, không gian góc quán đêm tĩnh lặng",
      en: "Gentle acoustic jazz piano, cozy quiet evening atmosphere",
    },
    url: "https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3",
  },
  {
    id: "acoustic-romance",
    title: { vi: "Acoustic Romance Guitar", en: "Acoustic Romance Guitar" },
    artist: "Sunlight Strings",
    desc: {
      vi: "Tiếng đàn guitar mộc mạc, ngọt ngào và tự nhiên",
      en: "Sweet acoustic guitar chords with sincere natural warmth",
    },
    url: "https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3",
  },
];

export interface InvitationConfig {
  themeId: string;
  customPalette?: PaletteColors;
  backgroundImage?: string;
  backgroundOverlayOpacity?: number;
  language: "vi" | "en";
  guestName: string;
  senderName: string;
  eventDate?: string; // Format: YYYY-MM-DD
  music?: MusicTrackConfig;
  cover: {
    badge?: string;
    subHeader?: string;
    title: string;
    note: string;
    cta: string;
    footerNote?: string;
    watermark?: string;
  };
  questions: QuestionBlock[];
  stepTicket: {
    badge: string;
    ticketType: string;
    quote: string;
    closingTitle: string;
    closingSub: string;
    actionSend: string;
    actionDownload: string;
    customShareMessage?: string;
  };
}

// Default Vietnamese Questions
export const defaultQuestionsVi: QuestionBlock[] = [
  {
    id: "time-slot",
    type: "course_card",
    title: "Khung giờ hẹn lý tưởng",
    subtitle: "Chọn một thời điểm bạn cảm thấy thư thái và dễ chịu nhất trong ngày",
    options: [
      {
        id: "sunset",
        title: "Hoàng hôn buông",
        subtitle: "16:30 — Khi nắng dịu dần và thành phố bắt đầu mát mẻ",
        badge: "Hoàng hôn lãng mạn",
      },
      {
        id: "night",
        title: "Đèn phố lên đèn",
        subtitle: "19:30 — Khi phố xá lung linh ánh đèn và đêm dịu êm",
        badge: "Đêm phố lung linh",
      },
    ],
  },
  {
    id: "vibe-location",
    type: "course_card",
    title: "Không gian buổi hẹn mong muốn",
    subtitle: "Nơi bạn muốn hai chúng mình cùng dừng chân trò chuyện",
    options: [
      {
        id: "balcony",
        title: "Góc ban công thoáng gió",
        subtitle: "Ngắm phố phường từ trên cao, nghe tiếng jazz nhẹ nhàng",
        badge: "Thoáng đãng",
      },
      {
        id: "cozy-cafe",
        title: "Quán cà phê nhỏ ấm cúng",
        subtitle: "Không gian yên tĩnh, ánh đèn vàng ấm áp và nhiều cây xanh",
        badge: "Ấm cúng",
      },
      {
        id: "gallery-walk",
        title: "Dạo bước tiệm sách & phòng tranh",
        subtitle: "Thong thả tản bộ, ngắm tranh và nói chuyện không vội vã",
        badge: "Thảnh thơi",
      },
    ],
  },
  {
    id: "drink-taste",
    type: "tag_pills",
    title: "Gu đồ uống yêu thích của bạn",
    subtitle: "Để mình chuẩn bị chu đáo trước những món hợp khẩu vị bạn nhất nhé",
    options: [
      { id: "coffee", title: "Cà phê đậm vị" },
      { id: "tea", title: "Trà hoa thanh nhẹ" },
      { id: "mocktail", title: "Mocktail trái cây mát lạnh" },
      { id: "juice", title: "Nước ép tươi tốt cho sức khỏe" },
      { id: "milk-tea", title: "Trà sữa ít ngọt" },
      { id: "hot-choco", title: "Cacao / Socola nóng" },
    ],
  },
  {
    id: "dislikes",
    type: "short_text",
    title: "Những điều bạn muốn né (nếu có)",
    subtitle: "Bất kỳ món ăn, đồ uống hay không gian nào làm bạn không thoải mái",
    placeholder: "Ví dụ: Không uống đá lạnh, dị ứng đậu phộng, né nơi quá ồn ào...",
  },
  {
    id: "secret-note",
    type: "long_text",
    title: "Lời nhắn gửi riêng cho mình",
    subtitle: "Một bài hát bạn đang nghe gần đây, hoặc bất cứ điều gì bạn nghĩ đến...",
    placeholder: "Gửi gắm đôi lời tâm tình trước buổi gặp nhé...",
  },
];

// Default English Questions
export const defaultQuestionsEn: QuestionBlock[] = [
  {
    id: "time-slot",
    type: "course_card",
    title: "Preferred Time Slot",
    subtitle: "Select a moment of the day that feels most comfortable to you",
    options: [
      {
        id: "sunset",
        title: "Golden Hour",
        subtitle: "16:30 — Soft breeze and gentle afternoon light",
        badge: "Sunset Vibe",
      },
      {
        id: "night",
        title: "Evening Lights",
        subtitle: "19:30 — City skyline illuminated beneath the night sky",
        badge: "Night Lights",
      },
    ],
  },
  {
    id: "vibe-location",
    type: "course_card",
    title: "Desired Ambiance & Setting",
    subtitle: "The setting where you would like us to converse",
    options: [
      {
        id: "balcony",
        title: "Open Balcony",
        subtitle: "City views, gentle jazz acoustics, and fresh air",
      },
      {
        id: "cozy-cafe",
        title: "Hidden Quiet Hideaway",
        subtitle: "Warm amber lighting, vintage books, and greenery",
      },
      {
        id: "gallery-walk",
        title: "Gallery & Bookstore Stroll",
        subtitle: "A slow unhurried walk surrounded by art and prints",
      },
    ],
  },
  {
    id: "drink-taste",
    type: "tag_pills",
    title: "Beverage Preferences",
    subtitle: "Allow me to curate what you enjoy most",
    options: [
      { id: "coffee", title: "Specialty Coffee" },
      { id: "tea", title: "Herbal & Floral Tea" },
      { id: "mocktail", title: "Fresh Mocktail" },
      { id: "juice", title: "Cold-Pressed Juice" },
      { id: "wine", title: "Natural Wine" },
      { id: "hot-choco", title: "Warm Cocoa" },
    ],
  },
  {
    id: "dislikes",
    type: "short_text",
    title: "Anything to Avoid...",
    subtitle: "Dietary preferences, allergies, or things you dislike",
    placeholder: "e.g., no iced drinks, peanut allergy, avoid overly loud venues...",
  },
  {
    id: "secret-note",
    type: "long_text",
    title: "A Little Secret Note",
    subtitle: "Anything you would like to share in advance...",
    placeholder: "A song on repeat lately, or a tiny note for our evening...",
  },
];

export const defaultInvitationConfigVi: InvitationConfig = {
  themeId: "alabaster",
  backgroundOverlayOpacity: 0.2,
  language: "vi",
  guestName: "Bạn",
  senderName: "Mình",
  cover: {
    badge: "THIỆP MỜI BUỔI HẸN ĐẦU TIÊN",
    title: "Một Buổi Hẹn Nhỏ Cho Hai Người",
    note: "Một buổi hẹn không áp lực, chỉ có trà ấm, chuyện trò và những điều bạn yêu thích. Chọn cùng mình một vài chi tiết nhỏ nhé.",
    cta: "Mở lời hẹn",
    footerNote: "Gửi riêng từ {{sender}}",
    watermark: "Khoảnh khắc dịu dàng cho hai người",
  },
  music: {
    trackId: "lofi-rhodes",
    title: "Vintage Lo-Fi Rhodes",
    artist: "Cuộc Hẹn Nhỏ Sessions",
  },
  questions: defaultQuestionsVi,
  stepTicket: {
    badge: "VÉ HẸN DÀNH CHO HAI NGƯỜI",
    ticketType: "BUỔI HẸN TRÒ CHUYỆN ẤM CÚNG",
    quote: "“Những khoảnh khắc đẹp nhất là khi mọi thứ thật tự nhiên và chân thành.”",
    closingTitle: "Lịch trình đã được xác nhận.",
    closingSub: "Mọi khâu sắp xếp còn lại, để mình lo.",
    actionSend: "Gửi cuống vé cho",
    actionDownload: "Lưu vé về máy",
  },
};

export const defaultInvitationConfigEn: InvitationConfig = {
  themeId: "alabaster",
  backgroundOverlayOpacity: 0.2,
  language: "en",
  guestName: "Date",
  senderName: "Host",
  cover: {
    badge: "INVITATION TO AN EVENING",
    title: "A Quiet Gathering for Two",
    note: "An unhurried evening with warm tea, thoughtful conversations, and things you enjoy. Help me curate a few small details for our ticket together.",
    cta: "Open Invitation",
    footerNote: "Warmly from {{sender}}",
    watermark: "A quiet moment for two",
  },
  music: {
    trackId: "lofi-rhodes",
    title: "Vintage Lo-Fi Rhodes",
    artist: "Cuộc Hẹn Nhỏ Sessions",
  },
  questions: defaultQuestionsEn,
  stepTicket: {
    badge: "FIRST DATE ADMISSION PASS",
    ticketType: "PRIVATE TASTING & TALK",
    quote: "“The best moments are those kept simple and sincere.”",
    closingTitle: "Itinerary Confirmed.",
    closingSub: "Leave all remaining arrangements to me.",
    actionSend: "Send Pass to",
    actionDownload: "Save Pass as Image",
  },
};

export const defaultInvitationConfig = defaultInvitationConfigVi;

export function formatDynamicShareMessage(
  config: InvitationConfig,
  answers: Record<string, string | string[]>
): string {
  if (config.stepTicket.customShareMessage) {
    return config.stepTicket.customShareMessage
      .replace(/{{sender}}/g, config.senderName)
      .replace(/{{guest}}/g, config.guestName);
  }

  const isEn = config.language === "en";
  const lines: string[] = [];

  if (config.eventDate) {
    const formatted = formatEventDate(config.eventDate, config.language);
    lines.push(isEn ? `📅 Date: ${formatted}` : `📅 Ngày hẹn: ${formatted}`);
  }

  config.questions.forEach((q) => {
    const raw = answers[q.id];
    if (raw) {
      if (Array.isArray(raw) && raw.length > 0) {
        lines.push(`• ${q.title}: ${raw.join(", ")}`);
      } else if (typeof raw === "string" && raw.trim()) {
        lines.push(`• ${q.title}: ${raw}`);
      }
    }
  });

  const body = lines.join("\n");

  if (isEn) {
    return (
      `💌 Our date admission pass is confirmed!\n\n` +
      `Dear ${config.senderName},\n` +
      `Here are my preferences for our evening:\n` +
      `${body}\n\n` +
      `Looking forward to our evening! ✨`
    );
  }

  return (
    `💌 Tấm vé hẹn của chúng mình đã sẵn sàng!\n\n` +
    `Gửi ${config.senderName},\n` +
    `Mình đã xác nhận lịch hẹn rồi nhé:\n` +
    `${body}\n\n` +
    `Hẹn gặp ${config.senderName} hôm đó nha! ✨`
  );
}

/**
 * Format ISO date string (YYYY-MM-DD) to friendly localized date string.
 * Fallback to gentle phrase if not set or invalid.
 */
export function formatEventDate(dateStr?: string, lang: "vi" | "en" = "vi"): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return lang === "en" ? "A gentle upcoming weekend" : "Một ngày cuối tuần thảnh thơi";
  }
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) {
    return lang === "en" ? "A gentle upcoming weekend" : "Một ngày cuối tuần thảnh thơi";
  }

  const daysOfWeekVi = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const daysOfWeekEn = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthsEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const dayOfWeek = date.getDay();
  if (lang === "en") {
    return `${daysOfWeekEn[dayOfWeek]}, ${monthsEn[m - 1]} ${d}, ${y}`;
  }
  return `${daysOfWeekVi[dayOfWeek]}, ngày ${d} tháng ${m}, ${y}`;
}

/**
 * Short date format e.g. "17/10/2026" or "10/17/2026"
 */
export function formatEventDateShort(dateStr?: string, lang: "vi" | "en" = "vi"): string {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  if (lang === "en") {
    return `${pad(m)}/${pad(d)}/${y}`;
  }
  return `${pad(d)}/${pad(m)}/${y}`;
}

/**
 * Extracts meeting time string "HH:mm" from user answers if available, defaulting to "19:00".
 */
export function extractTimeFromAnswers(answers: Record<string, string | string[]>): string {
  for (const val of Object.values(answers)) {
    const text = Array.isArray(val) ? val.join(" ") : String(val);
    const match = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (match) {
      const hour = String(match[1]).padStart(2, "0");
      const minute = match[2];
      return `${hour}:${minute}`;
    }
  }
  return "19:00";
}

/**
 * Calculate upcoming target date (e.g. next Saturday or next Sunday) as YYYY-MM-DD
 */
export function getUpcomingDate(targetDayOfWeek: number, weeksOffset = 0): string {
  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = (targetDayOfWeek - currentDay + 7) % 7;
  if (daysUntil === 0 && weeksOffset === 0) {
    daysUntil = 7;
  }
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntil + weeksOffset * 7);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface CalendarEventData {
  title: string;
  details: string;
  location?: string;
  startDateStr: string; // YYYY-MM-DD
  startTimeStr?: string; // HH:mm
  durationHours?: number; // default 2.5
}

/**
 * Generates Google Calendar link
 */
export function createGoogleCalendarUrl(params: CalendarEventData): string {
  const { title, details, location = "", startDateStr, startTimeStr = "19:00", durationHours = 2.5 } = params;
  const [y, m, d] = startDateStr.split("-").map(Number);
  const [hour, minute] = startTimeStr.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");

  const startIso = `${y}${pad(m)}${pad(d)}T${pad(hour)}${pad(minute)}00`;
  const endTotalMinutes = hour * 60 + minute + Math.round(durationHours * 60);
  const endHour = Math.floor(endTotalMinutes / 60) % 24;
  const endMinute = endTotalMinutes % 60;
  const endIso = `${y}${pad(m)}${pad(d)}T${pad(endHour)}${pad(endMinute)}00`;

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title);
  url.searchParams.set("dates", `${startIso}/${endIso}`);
  url.searchParams.set("details", details);
  if (location) url.searchParams.set("location", location);
  return url.toString();
}

/**
 * Generates RFC 5545 iCalendar (.ics) string for Apple Calendar, Outlook, etc.
 */
export function createIcsFileContent(params: CalendarEventData): string {
  const { title, details, location = "", startDateStr, startTimeStr = "19:00", durationHours = 2.5 } = params;
  const [y, m, d] = startDateStr.split("-").map(Number);
  const [hour, minute] = startTimeStr.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");

  const dtStart = `${y}${pad(m)}${pad(d)}T${pad(hour)}${pad(minute)}00`;
  const endTotalMinutes = hour * 60 + minute + Math.round(durationHours * 60);
  const endHour = Math.floor(endTotalMinutes / 60) % 24;
  const endMinute = endTotalMinutes % 60;
  const dtEnd = `${y}${pad(m)}${pad(d)}T${pad(endHour)}${pad(endMinute)}00`;
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const cleanDetails = details.replace(/\r?\n/g, "\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cuoc Hen Nho//Invitation Studio//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:cuochennho-${Date.now()}@cuochennho.vercel.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${cleanDetails}`,
    location ? `LOCATION:${location}` : "",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}
