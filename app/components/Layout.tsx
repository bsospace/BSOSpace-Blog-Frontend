"use client";
import { ReactNode } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../contexts/ThemeContext";

const Layout = ({ children }: { children: ReactNode }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? "bg-space-dark text-white" : "bg-space-light text-black"
      }`}
    >
      <header className="bg-gray-800 text-white p-4 top-0 z-50">
        <div className="md:max-w-screen-lg sm:w-full mx-auto flex justify-between items-center">
          <h1
            onClick={() => (window.location.href = "/")}
            className="text-xl font-bold cursor-pointer"
          >
            BSO Space Blog
          </h1>
          {/* <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
            aria-label={
              darkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {darkMode ? (
              <FaSun className="text-yellow-500 w-6 h-6" />
            ) : (
              <FaMoon className="text-gray-800 w-6 h-6" />
            )}
          </button> */}
        </div>
      </header>

      <main className="flex-grow container max-w-screen-lg mx-auto p-4">
        {children}
      </main>

      <footer className="bg-gray-800 text-white p-1">
        <div className="container mx-auto text-center text-sm">
          &copy; 2024 BSO Space Blog. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
