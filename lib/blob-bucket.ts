/** Month folder (YYMM, UTC) used to group blobs so cleanup can drop a month at once. */
export function toBucket(date: Date): string {
  const yy = String(date.getUTCFullYear() % 100).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return yy + mm;
}
