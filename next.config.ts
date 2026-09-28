import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/*": ["./archive/**/*"],
  },
};

export default nextConfig;
