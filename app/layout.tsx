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
import AuthGuard from "./contexts/auth-gard";

export const metadata: Metadata = {
  title: "BSO Space Blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
          <AuthGuard>
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
          </AuthGuard>
      </body>
    </html >
  );
}
