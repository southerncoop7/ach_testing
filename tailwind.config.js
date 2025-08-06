/** @type {import('tailwindcss').Config} */
module.exports = {
  /**
   * The `content` array tells Tailwind CSS which files to scan for class names.
   * This is crucial for tree-shaking unused styles and keeping the final CSS bundle small.
   *
   * @see https://tailwindcss.com/docs/content-configuration
   */
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',

  /**
   * The `theme` object is where you define your project's color palette, type scale,
   * fonts, breakpoints, border radius values, and more.
   *
   * @see https://tailwindcss.com/docs/theme
   */
  theme: {
    /**
     * The `extend` key allows you to add new values to Tailwind's default theme
     * without overriding them entirely.
     *
     * @see https://tailwindcss.com/docs/theme#extending-the-default-theme
     */
    extend: {
      /**
       * Custom font families for the project.
       * The `sans` key defines the default sans-serif font stack.
       */
      fontFamily: {
        sans: [
          'Apercu',
          'Inter',
          'Segoe UI',
          'Arial',
          'sans-serif',
        ],
      },
      /**
       * Custom color palette for the project.
       * These colors can be used with Tailwind's utility classes (e.g., `bg-primary`, `text-danger`).
       */
      colors: {
        primary: '#3EB1C8',
        primaryDark: '#00635B',
        success: '#249E6B',
        successLight: '#B3CFAE',
        warning: '#FFB549',
        warningLight: '#F5E1A4',
        danger: '#DD0033',
        dangerDark: '#940929',
        accent: '#E35205',
        accentLight: '#F8C1B8',
        neutral: '#5B6770',
        neutralLight: '#DAD7D2',
        white: '#FFFFFF',
        purple: '#994878',
        dark: {
          primary: '#3EB1C8',
          primaryDark: '#00635B',
          success: '#249E6B',
          successLight: '#B3CFAE',
          warning: '#FFB549',
          warningLight: '#F5E1A4',
          danger: '#DD0033',
          dangerDark: '#940929',
          accent: '#E35205',
          accentLight: '#F8C1B8',
          neutral: '#DAD7D2',
          neutralLight: '#5B6770',
          'background': '#000080',
          'foreground': '#ededed',
        },
      },
      /**
       * Custom border radius values for elements like cards and buttons.
       */
      borderRadius: {
        card: '8px',
        button: '6px',
        badge: '12px',
      },
      /**
       * Custom box shadow values for creating depth and elevation.
       */
      boxShadow: {
        card: '0 2px 8px rgba(91, 103, 112, 0.1)',
        cardHover: '0 4px 16px rgba(91, 103, 112, 0.15)',
        button: '0 2px 4px rgba(62, 177, 200, 0.2)',
        buttonHover: '0 4px 8px rgba(62, 177, 200, 0.3)',
        kpi: '0 2px 12px rgba(91, 103, 112, 0.1)',
      },
    },
  },

  /**
   * The `plugins` array allows you to register third-party plugins with Tailwind CSS.
   * Plugins can add new utilities, components, or base styles.
   *
   * @see https://tailwindcss.com/docs/plugins
   */
  plugins: [],
};