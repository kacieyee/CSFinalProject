import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  compiler: {
    styledComponents: true,
  },

  webpack(config) {
    config.resolve.modules.push(__dirname + '/src');
    return config;
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
