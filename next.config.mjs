/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage (all projects on supabase.co)
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Supabase Storage (custom domains via supabase.in)
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'www.somafixkenya.co.ke',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.somafix.com.tr',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
