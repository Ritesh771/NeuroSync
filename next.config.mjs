/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pdfjs-dist': 'pdfjs-dist',
      });
    }
    return config;
  },
};

export default nextConfig;
