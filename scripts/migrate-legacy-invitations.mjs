// One-off: copy invitations from the old Supabase table into Vercel Blob so that
// /invite?id=<id> links already sent keep working (served from legacy/<id>.json).
// Files the configs point at in Supabase Storage are copied to legacy-assets/,
// which the cleanup cron never touches.
//
// Dry run (default) only prints what would happen:
//   SUPABASE_URL=... SUPABASE_KEY=... BLOB_READ_WRITE_TOKEN=... node scripts/migrate-legacy-invitations.mjs
// Write for real:
//   ... node scripts/migrate-legacy-invitations.mjs --apply
import { put } from "@vercel/blob";

const { SUPABASE_URL, SUPABASE_KEY, BLOB_READ_WRITE_TOKEN } = process.env;
const apply = process.argv.includes("--apply");

if (!SUPABASE_URL || !SUPABASE_KEY || !BLOB_READ_WRITE_TOKEN) {
  console.error("Set SUPABASE_URL, SUPABASE_KEY and BLOB_READ_WRITE_TOKEN.");
  process.exit(1);
}

const ID_RE = /^[abcdefghjkmnpqrstuvwxyz23456789]{8}$/;
const storagePrefix = `${SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/`;

async function copyAsset(url) {
  if (typeof url !== "string" || !url.startsWith(storagePrefix)) return url;
  const name = url.slice(storagePrefix.length).replace(/[^a-zA-Z0-9._/-]/g, "_");
  if (!apply) {
    console.log(`  would copy asset ${name}`);
    return url;
  }
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`  asset missing (${res.status}), dropping: ${name}`);
    return undefined;
  }
  const blob = await put(`legacy-assets/${name}`, Buffer.from(await res.arrayBuffer()), {
    access: "public",
    token: BLOB_READ_WRITE_TOKEN,
    contentType: res.headers.get("content-type") || undefined,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/invitations?select=id,config`, {
  headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
});
if (!res.ok) {
  console.error(`Supabase read failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}
const rows = await res.json();
console.log(`${rows.length} invitation(s) found. Mode: ${apply ? "APPLY" : "dry run"}`);

for (const { id, config } of rows) {
  if (!ID_RE.test(id)) {
    console.warn(`skip ${id}: not a generated id`);
    continue;
  }
  const next = { ...config };
  next.backgroundImage = await copyAsset(config.backgroundImage);
  if (next.backgroundImage === undefined) delete next.backgroundImage;
  if (config.music?.url) {
    const musicUrl = await copyAsset(config.music.url);
    if (musicUrl) next.music = { ...config.music, url: musicUrl };
    else delete next.music;
  }

  if (apply) {
    await put(`legacy/${id}.json`, JSON.stringify({ v: 1, config: next }), {
      access: "public",
      token: BLOB_READ_WRITE_TOKEN,
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  }
  console.log(`${apply ? "migrated" : "would migrate"} ${id}`);
}
