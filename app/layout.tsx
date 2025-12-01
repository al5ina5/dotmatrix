import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SWRConfig } from "swr";
import "./globals.css";
import { ConfigProvider } from "@/context/ConfigContext";
import { PWAInstall } from "@/components/PWAInstall";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DotMatrix LED Ticker",
  description: "Multi-line LED dot matrix ticker display with dynamic plugins",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DotMatrix",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SWRConfig
          value={{
            // Global SWR configuration to prevent API spamming
            revalidateOnFocus: false,      // Don't refetch when window regains focus
            revalidateOnReconnect: false,  // Don't refetch when reconnecting
            revalidateIfStale: false,      // Don't refetch stale data automatically
            dedupingInterval: 5000,        // Dedupe requests within 5 seconds
            shouldRetryOnError: true,      // Retry failed requests
            errorRetryCount: 3,            // Max 3 retries
            errorRetryInterval: 5000,      // Wait 5s between retries
            // Only revalidate based on refreshInterval (set per plugin)
          }}
        >
          <ConfigProvider>
            <PWAInstall />
            {children}
          </ConfigProvider>
        </SWRConfig>
      </body>
    </html>
  );
}
