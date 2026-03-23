/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.bewama.com' }],
        destination: 'https://bewama.com/:path*',
        permanent: true,
      },
    ]
  },
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
      {
        protocol: 'https',
        hostname: 'www.gypsumceilingkenya.co.ke',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
