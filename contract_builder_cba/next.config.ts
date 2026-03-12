import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@databricks/sql",
    "lz4",
    "node-forge",
    "nodemailer",
  ],
};

export default nextConfig;
