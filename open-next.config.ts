import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page is rendered per request (data comes live from Convex), so no
// incremental cache (R2) is configured.
export default defineCloudflareConfig({});
