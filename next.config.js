import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["swisseph-v2"],
  webpack: (config, { dev, isServer }) => {
    // Disable webpack cache to resolve caching issues
    config.cache = false;

    // Preserve existing alias configuration
    config.resolve.alias["@"] = path.join(process.cwd(), "src");

    return config;
  },
};

export default nextConfig;
