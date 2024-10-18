import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Layout from "./components/Layout";
import { AuthProvider } from "./contexts/authContext";
import Providers from "./components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BSO space Blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Providers>
            <Layout>{children}</Layout>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
