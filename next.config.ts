import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "/*": ["./archive/**/*"],
  },
  serverExternalPackages: ["nodemailer"],
};

export default nextConfig;
