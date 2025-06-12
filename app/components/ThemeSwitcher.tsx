"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { MoonIcon } from "./MoonIcon";
import { SunIcon } from "./SunIcon";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevents hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex items-center space-x-2">
      {theme === "dark" ? (
        <MoonIcon
          onClick={() => setTheme("light")}
          className="w-6 h-6 text-white ml-2 cursor-pointer hover:scale-105 transition-transform"
        />
      ) : (
        <SunIcon
          onClick={() => setTheme("dark")}
          className="w-6 h-6 text-yellow-500 ml-2 cursor-pointer hover:scale-105 transition-transform"
        />
      )}
    </div>
  );
}
