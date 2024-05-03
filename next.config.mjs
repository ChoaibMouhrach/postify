/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "scontent.fcmn5-1.fna.fbcdn.net",
      },
    ],
  },
};

export default nextConfig;
