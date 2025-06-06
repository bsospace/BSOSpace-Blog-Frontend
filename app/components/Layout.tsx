"use client";
import { ReactNode, useContext, useEffect, useState, useRef } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import Image from "next/image";
import logo from "../../public/BSO LOGO.svg";
import Link from "next/link";
import axios from "axios";
import Script from "next/script";
import { AuthContext } from "../contexts/authContext";
import { ChevronDown, LogOut, Notebook, Settings, SquarePen, User, UserCircle } from "lucide-react";
import { getnerateId } from "@/lib/utils";
import { FiCode, FiCpu } from "react-icons/fi";

export default function Layout({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState<string>("unknown");
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, setIsLoggedIn, setUser } = useContext(AuthContext);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setIsOpen(false);
    localStorage.clear();
    window.location.href = "/";
  };

  const navigateToLogin = () => {
    window.location.href = "/auth/login";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      <Script
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
      ></Script>

      {/* Header */}
      <header className="sticky top-0 py-2 px-4 z-50 border-b border-slate-800 shadow-md bg-white dark:bg-gray-900">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2  no-underline text-black dark:text-white">
              <Image src={logo} alt="BSO logo" width={40} height={40} />
              {/* <span className="font-semibold text-lg hidden md:block ">BSO Space</span> */}
            </Link>
          </div>

          {/* Navigation Links and Controls */}
          <div className="flex items-center gap-6">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="https://github.com/bsospace"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-[#fb923c] dark:hover:text-[#fb923c] transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://www.youtube.com/@BSOSpace"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 dark:text-gray-300 hover:text-[#fb923c] dark:hover:text-[#fb923c] transition-colors"
              >
                YouTube
              </a>
            </nav>

            {/* Divider - only show on desktop */}
            <div className="hidden md:block h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

            {/* Controls: Theme + Profile */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#fb923c] focus:ring-opacity-50"
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                >
                  {isLoggedIn && user ? (
                    <>
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm">
                        <img
                          src={user.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </>
                  ) : (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800">
                      <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 origin-top-right transition-all duration-200 ease-out">
                    <div className="p-4">
                      {isLoggedIn && user ? (
                        <>
                          {/* Logged-in State */}
                          <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow">
                              <img
                                src={user.avatar}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-lg text-gray-900 dark:text-white truncate">
                                {user.username || user.email.split("@")[0]}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {/* User Role Badge */}
                          {/* <div className="mt-3 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {user.role === "ADMIN" ? "แอดมิน" : "สมาชิก"}
                            </span>
                          </div> */}

                          {/* Menu Items */}
                          <div className="mt-4 space-y-1">
                            <Link
                              href={`/w/${getnerateId()}`}
                              className="flex no-underline items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                              onClick={() => setIsOpen(false)}
                            >
                              <SquarePen className="w-5 h-5" />
                              <span>เขียนบทความ</span>
                            </Link>
                            <Link
                              href={`/w`}
                              className="flex no-underline items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                              onClick={() => setIsOpen(false)}
                            >
                              <Notebook className="w-5 h-5" />
                              <span>บทความของฉัน</span>
                            </Link>
                            <Link
                              href={`${'/@'}${user.username}`}
                              className="flex no-underline items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                              onClick={() => setIsOpen(false)}
                            >
                              <UserCircle className="w-5 h-5" />
                              <span>โปรไฟล์ของฉัน</span>
                            </Link>
                            <Link
                              href="/settings"
                              className="flex no-underline items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                              onClick={() => setIsOpen(false)}
                            >
                              <Settings className="w-5 h-5" />
                              <span>ตั้งค่า</span>
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full no-underline flex items-center gap-3 px-3 py-2.5 mt-2 text-sm text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <LogOut className="w-5 h-5" />
                              <span>ออกจากระบบ</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Logged-out State */}
                          <div className="py-3 text-center text-gray-700 dark:text-gray-300 mb-4">
                            <h3 className="font-semibold text-xl mb-1 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                              ยินดีต้อนรับ
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              เข้าสู่ระบบเพื่อเข้าถึงโปรไฟล์ของคุณ
                            </p>
                          </div>

                          <div className="space-y-3">
                            <button
                              onClick={navigateToLogin}
                              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:brightness-110 text-white font-medium rounded-lg transition-all shadow"
                            >
                              เข้าสู่ระบบ
                            </button>
                          </div>
                        </>

                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full mx-auto md:p-6 p-4">

        {/* Background tech elements */}
        <div className="absolute inset-0 overflow-hidden mt-16">
          <div className="absolute top-10 left-1/4 w-64 mt-16 h-64 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-48 h-48 bg-gradient-to-br from-red-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
        </div>
        {children}
      </main>

      {/* Footer tech elements */}
      <footer className="text-center py-3 border-t border-slate-800">
        <div className="flex justify-center items-center space-x-4 text-slate-400">
          <FiCode className="w-5 h-5 text-orange-400" />
          <span className="text-sm">Be Simple but Outstanding | Version: {version} | &copy; {new Date().getFullYear()} BSO Space</span>
          <FiCpu className="w-5 h-5 text-red-400" />
        </div>
      </footer>
    </div>
  );
}