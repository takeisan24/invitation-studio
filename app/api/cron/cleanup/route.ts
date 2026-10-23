import { NextRequest, NextResponse } from "next/server";
import { del, list } from "@vercel/blob";
import { blobToken, INVITE_MAX_DAYS } from "@/lib/server/invite-store";
import { toBucket } from "@/lib/blob-bucket";

// Weekly cron (vercel.json). Deletes whole month folders:
// - invites/<YYMM>/ once that expiry month has passed;
// - assets/<YYMM>/ once older than the longest an invite can live, plus a month.
// Each list() is a billable Advanced Operation, so folders are listed, not files.
const ASSET_RETENTION_MONTHS = Math.ceil(INVITE_MAX_DAYS / 30) + 1;

async function monthFolders(prefix: string, token: string): Promise<string[]> {
  const folders: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, mode: "folded", cursor, token });
    folders.push(...page.folders);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return folders;
}

async function deleteFolder(prefix: string, token: string): Promise<number> {
  let deleted = 0;
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, token, limit: 1000 });
    if (page.blobs.length > 0) {
      await del(page.blobs.map((b) => b.url), { token });
      deleted += page.blobs.length;
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return deleted;
}

function bucketOf(folder: string): string | null {
  return /\/(\d{4})\/$/.exec(folder)?.[1] ?? null;
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const token = blobToken();
  if (!secret || !token) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const currentBucket = toBucket(now);
  const assetCutoff = toBucket(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - ASSET_RETENTION_MONTHS, 1))
  );

  const removed: Record<string, number> = {};
  for (const folder of await monthFolders("invites/", token)) {
    const bucket = bucketOf(folder);
    if (bucket && bucket < currentBucket) removed[folder] = await deleteFolder(folder, token);
  }
  for (const folder of await monthFolders("assets/", token)) {
    const bucket = bucketOf(folder);
    if (bucket && bucket < assetCutoff) removed[folder] = await deleteFolder(folder, token);
  }

  return NextResponse.json({ removed });
}
