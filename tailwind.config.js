/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Apercu',
          'Inter',
          'Segoe UI',
          'Arial',
          'sans-serif',
        ],
      },
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
      },
      borderRadius: {
        card: '8px',
        button: '6px',
        badge: '12px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(91, 103, 112, 0.1)',
        cardHover: '0 4px 16px rgba(91, 103, 112, 0.15)',
        button: '0 2px 4px rgba(62, 177, 200, 0.2)',
        buttonHover: '0 4px 8px rgba(62, 177, 200, 0.3)',
        kpi: '0 2px 12px rgba(91, 103, 112, 0.1)',
      },
    },
  },
  plugins: [],
}; 