import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@databricks/sql",
    "lz4",
    "node-forge",
    "nodemailer",
  ],
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3002"),
  },
};

export default nextConfig;
