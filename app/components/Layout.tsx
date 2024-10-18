"use client";
import { ReactNode } from "react";
import ThemeSwitcher from "./ThemeSwitcher";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-gray-900 text-white p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center ">
          <h1
            onClick={() => (window.location.href = "/")}
            className="text-xl font-bold cursor-pointer"
          >
            BSO Space Blog
          </h1>
          <div className="flex items-center">
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-screen-xl border mx-auto p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="container mx-auto text-center">
          Be Simple but Outstanding | &copy; 2024 BSO Space Blog. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
}
