import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/authContext";
import Providers from "./components/providers";

const inter = Inter({ subsets: ["latin"] });
import { Toaster } from "@/components/ui/toaster"

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
        <AuthProvider>
          <Providers>
            <Toaster />
            <Layout>{children}</Layout>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
