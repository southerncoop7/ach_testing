import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from '@/lib/context/AppContext';

/**
 * The Geist font for sans-serif text.
 * It's pre-loaded with the 'latin' subset and assigned a CSS variable for easy use throughout the app.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * The Geist Mono font for monospaced text.
 * Also pre-loaded with the 'latin' subset and assigned a CSS variable.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata for the application, used for SEO and browser tab information.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/metadata
 */
export const metadata: Metadata = {
  title: "ACH Payment Tester",
  description: "An application to generate ACH test files.",
};

/**
 * The root layout component for the entire application.
 * It wraps all pages and sets up the global structure, fonts, and context providers.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {JSX.Element} The root layout of the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* The AppProvider wraps the entire application, making the global state available to all components. */}
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}