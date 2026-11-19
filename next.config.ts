import type { NextConfig } from "next";

// Blob store id is part of every public file URL, so it is safe to expose; the token is not.
// The invite sanitizer uses the host to accept background images from this store only.
const blobStoreId = process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3];

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: blobStoreId ? { NEXT_PUBLIC_BLOB_HOST: `${blobStoreId}.public.blob.vercel-storage.com` } : {},
};

export default nextConfig;
