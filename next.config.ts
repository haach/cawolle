import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "cawolle.de" }],
        destination: "https://www.cawolle.de",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "cawolle.de" }],
        destination: "https://www.cawolle.de/:path*",
        permanent: true,
      },
    ];
  },
  outputFileTracingExcludes: {
    "/*": ["./archive/**/*"],
  },
  serverExternalPackages: ["nodemailer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ebayimg.com" },
      { protocol: "https", hostname: "ir.ebaystatic.com" },
    ],
  },
};

export default nextConfig;
