import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // content/resume.md is read with fs at runtime by /api/chat — make sure it ships with the serverless bundle.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/**/*"],
  },
};

export default nextConfig;
