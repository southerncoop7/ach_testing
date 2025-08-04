import type { NextConfig } from "next";

/**
 * Configuration object for Next.js.
 *
 * @see https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
const nextConfig: NextConfig = {
  /**
   * Specifies the output mode for the application.
   * 'export' generates a static HTML export of the app, which can be hosted on any static hosting service.
   * This is ideal for sites that do not require a Node.js server.
   *
   * @see https://nextjs.org/docs/app/building-your-application/deploying/static-exports
   */
  output: 'export',

  /**
   * Determines if trailing slashes should be added to URLs.
   * When set to `true`, URLs will have a trailing slash (e.g., /about/).
   * This can be important for SEO and consistency in URL structure.
   *
   * @see https://nextjs.org/docs/api-reference/next.config.js/trailing-slash
   */
  trailingSlash: true,

  /**
   * Configuration for Next.js Image Optimization.
   *
   * @see https://nextjs.org/docs/api-reference/next/image#unoptimized
   */
  images: {
    /**
     * When `true`, the Next.js Image Optimization API is disabled.
     * Images will be served as-is, without any resizing, reformatting, or optimization.
     * This is useful for static exports where the image optimization service is not available.
     */
    unoptimized: true
  }
};

export default nextConfig;