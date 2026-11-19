import type { NextConfig } from "next";

// Blob store id is part of every public file URL, so it is safe to expose; the token is not.
// The invite sanitizer uses the host to accept uploaded files from this store only.
const blobStoreId = /^vercel_blob_rw_([A-Za-z0-9]+)_/.exec(process.env.BLOB_READ_WRITE_TOKEN ?? "")?.[1];

if (process.env.VERCEL_ENV === "production" && !blobStoreId) {
  throw new Error("BLOB_READ_WRITE_TOKEN is missing or malformed: cannot derive the Blob store host for production builds.");
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: blobStoreId ? { NEXT_PUBLIC_BLOB_HOST: `${blobStoreId.toLowerCase()}.public.blob.vercel-storage.com` } : {},
};

export default nextConfig;
