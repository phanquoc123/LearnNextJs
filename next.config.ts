import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images:{
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    ['domains']: ['placehold.co'],
  }
};

export default nextConfig;
