/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  images: { remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }] },
};
