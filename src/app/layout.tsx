import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
import "swiper/css";
import "swiper/css/navigation";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { SITE } from "@/lib/site";

// Luxury pairing: Cormorant Garamond (headings) + Jost (text)
const sans = Jost({ variable: "--font-sans-modern", subsets: ["latin"], weight: ["300", "400", "500", "600"] });
const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.name,
  verification: { google: SITE.googleSiteVerification },
  icons: {
    icon: [
      { url: "/assets/brand/icon-32.png", sizes: "32x32" },
      { url: "/assets/brand/icon-192.png", sizes: "192x192" },
    ],
    apple: "/assets/brand/icon-192.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // lang is "fr" by default; scripts/postbuild.mjs sets lang="en" on every page under /en/.
    <html lang="fr" className={`${sans.variable} ${display.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {/* Google tag (same ID as the WordPress site, via Site Kit) */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE.googleTag}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${SITE.googleTag}');`}
        </Script>
        <Providers>
          {children}
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
