import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

export default nextConfig;

// Gives `next dev` access to Cloudflare bindings, matching the deployed Worker.
initOpenNextCloudflareForDev();
