import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-namecheap-domain.com', // Replace with jradianceco.com domain
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
