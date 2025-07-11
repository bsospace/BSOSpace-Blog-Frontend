import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/authContext";
import Providers from "./components/providers";

const inter = Inter({ subsets: ["latin"] });
import { Toaster } from "@/components/ui/toaster"
import { SEOProvider } from "./contexts/seoContext";
import HelmetContextProvider from "./contexts/HelmetProvider";

export const metadata: Metadata = {
  title: "BSO Space Blog",
  description:
    "BSO Blog is a collaborative blogging platform created by Software Engineering students, aimed at sharing knowledge, cutting-edge techniques, and real-world experiences.",
  openGraph: {
    title: "BSO Space Blog",
    description:
      "BSO Blog is a collaborative blogging platform created by Software Engineering students, aimed at sharing knowledge, cutting-edge techniques, and real-world experiences.",
    url: "https://blog.bsospace.com",
    type: "website",
    images: [
      {
        url: "https://blog.bsospace.com/blog-image.webp",
        width: 1200,
        height: 630,
        alt: "BSO Space Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BSO Space Blog",
    description:
      "BSO Blog is a collaborative blogging platform created by Software Engineering students, aimed at sharing knowledge, cutting-edge techniques, and real-world experiences.",
    images: ["https://blog.bsospace.com/blog-image.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <HelmetContextProvider>
          <SEOProvider>
            <AuthProvider>
              <Providers>
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
