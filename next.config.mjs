import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.externals.push('bun:sqlite');
    return config;
  },
  images: { remotePatterns: [{ hostname: 's2.googleusercontent.com' }] },
  serverExternalPackages: ['pdf-parse'],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
