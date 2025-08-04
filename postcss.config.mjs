/**
 * Configuration for PostCSS, a tool for transforming CSS with JavaScript plugins.
 * This configuration is used by Next.js to process CSS files.
 *
 * @see https://github.com/postcss/postcss
 */
const config = {
  /**
   * A list of PostCSS plugins to use.
   * The order of plugins can be important.
   */
  plugins: [
    /**
     * Integrates Tailwind CSS with PostCSS.
     * This plugin scans your HTML, JavaScript, and other template files for class names
     * and generates the corresponding CSS.
     *
     * @see https://tailwindcss.com/docs/installation/using-postcss
     */

    "@tailwindcss/postcss"
  ],
};

export default config;