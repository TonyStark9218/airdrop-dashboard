/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      // Allow images from all domains
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
        },
        {
          protocol: 'http',
          hostname: '**',
        }
      ],
      // Support various formats including SVG
      dangerouslyAllowSVG: true,
      // Increase size limit if needed for larger images
      contentDispositionType: 'attachment',
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
  };
  
  export default nextConfig;
  
  