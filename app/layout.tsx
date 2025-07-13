import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/authContext";
import Providers from "./components/providers";

const inter = Inter({ subsets: ["latin"] });
import { Toaster } from "@/components/ui/toaster"
import { SEOProvider } from "./contexts/seoContext";
import HelmetContextProvider from "./contexts/HelmetProvider";
import PerformanceMonitor from "./components/PerformanceMonitor";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.bsospace.com'),
  title: {
    default: "BSO Space Blog - Software Engineering Knowledge Hub",
    template: "%s | BSO Space Blog"
  },
  description:
    "BSO Blog is a collaborative blogging platform created by Software Engineering students, aimed at sharing knowledge, cutting-edge techniques, and real-world experiences in software development, programming, and technology.",
  keywords: [
    "software engineering",
    "programming",
    "technology",
    "blog",
    "coding",
    "development",
    "BSO Space",
    "student projects",
    "tech knowledge"
  ],
  authors: [{ name: "BSO Space Team" }],
  creator: "BSO Space",
  publisher: "BSO Space",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
  alternates: {
    canonical: 'https://blog.bsospace.com',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://blog.bsospace.com",
    title: "BSO Space Blog - Software Engineering Knowledge Hub",
    description:
      "BSO Blog is a collaborative blogging platform created by Software Engineering students, aimed at sharing knowledge, cutting-edge techniques, and real-world experiences.",
    siteName: "BSO Space Blog",
    images: [
      {
        url: "https://blog.bsospace.com/blog-image.webp",
        width: 1200,
        height: 630,
        alt: "BSO Space Blog - Software Engineering Knowledge Hub",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BSO Space Blog - Software Engineering Knowledge Hub",
    description:
      "BSO Blog is a collaborative blogging platform created by Software Engineering students, aimed at sharing knowledge, cutting-edge techniques, and real-world experiences.",
    images: ["https://blog.bsospace.com/blog-image.webp"],
    creator: "@bsospace", // Add your Twitter handle
    site: "@bsospace", // Add your Twitter handle
  },
  other: {
    "msapplication-TileColor": "#000000",
    "theme-color": "#000000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="BSO Space Blog" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BSO Space Blog" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <HelmetContextProvider>
          <SEOProvider>
            <AuthProvider>
              <Providers>
                <PerformanceMonitor />
                <Toaster />
                <Layout>{children}</Layout>
              </Providers>
            </AuthProvider>
          </SEOProvider>
        </HelmetContextProvider>
      </body>
    </html >
  );
}
