"use client";
import { ReactNode, useEffect, useState } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import Image from "next/image";
import logo from "../../public/BSO LOGO.svg";
import Link from "next/link";
import axios from "axios";

export default function Layout({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState<string>("unknown");

  useEffect(() => {
    const fetchLatestVersion = async () => {
      try {
        const response = await axios.get(
          "https://api.github.com/repos/bsospace/BSOSpace-Blog-Frontend/releases/latest"
        );
        setVersion(response.data.tag_name || "unknown");
      } catch (error) {
        console.error("Error fetching latest version from GitHub:", error);
        setVersion("unknown");
      }
    };

    fetchLatestVersion();
  }, []);

  return (
    <div className="flex flex-col min-h-screen dark:bg-space-dark bg-space-light">
      <script
        data-name="BMC-Widget"
        data-cfasync="false"
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
        data-id="bsospace"
        data-description="Support me on Buy me a coffee!"
        data-message=""
        data-color="#FF813F"
        data-position="Right"
        data-x_margin="18"
        data-y_margin="18"
      ></script>
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
      <main className="flex-grow w-full max-w-screen-xl mx-auto md:p-6 p-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1F1F1F] py-4">
        <div className="container mx-auto text-center md:text-body-15pt-medium text-[10px]">
          Be Simple but Outstanding | Version: {version} | &copy; 2025 BSO Space
          Blog. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
