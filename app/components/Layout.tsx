"use client";
import { ReactNode } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import Image from "next/image";
import logo from "../../public/BSO LOGO.svg";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen dark:bg-space-dark bg-space-light">
      {/* Header */}
      <header className="sticky top-0 p-2 z-50 bg-white dark:bg-[#1F1F1F] shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <Image src={logo} alt="BSO logo" width={40} height={40} />
          </Link>

          {/* Navigation Links and Theme Switcher */}
          <div className="w-full flex justify-end">
            <div className="flex gap-4 w-full justify-end items-center">
              <a
                href="https://github.com/BSO-Space"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
              <a
                href="https://www.youtube.com/@BSOSpace"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                YouTube
              </a>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-screen-xl mx-auto p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1F1F1F] py-4">
        <div className="container mx-auto text-center">
          Be Simple but Outstanding | &copy; 2024 BSO Space Blog. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
