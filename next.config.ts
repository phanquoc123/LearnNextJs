import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images:{
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    ['domains']: ['placehold.co'],
  },
  experimental: {
    ppr: 'incremental'
  },
   eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
