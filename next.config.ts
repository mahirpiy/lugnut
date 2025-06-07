import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.SUPABASE_URL!.split("://")[1].split(":")[0],
        port: "",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
