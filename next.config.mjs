/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Imagens dos produtos ficam no Supabase Storage
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

export default nextConfig;
