"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 relative">
            {/* Animated 404 */}
            <div className="relative mb-10 text-center">
                <h1 className="text-8xl md:text-9xl font-extrabold text-gray-200 dark:text-gray-800 select-none">
                    404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-700 via-pink-500 to-orange-400 text-transparent bg-clip-text animate-pulse">
                        ไม่พบหน้านี้
                    </span>
                </div>
            </div>

            {/* Content section styled like .content */}
            <div className="content text-center mb-10 max-w-xl">
                <p className="text-xl text-gray-800 dark:text-gray-300 mb-4">
                    ขออภัย เราไม่พบหน้าที่คุณกำลังมองหา
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                    หน้านี้อาจถูกลบ ย้าย หรือไม่เคยมีอยู่เลย <br />
                    ลองค้นหาบทความหรือกลับไปหน้าหลัก
                </p>
            </div>

            {/* Search Box */}
            <div className="w-full max-w-md mb-8">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="ค้นหาบทความ..."
                        className="w-full py-3 px-4 pr-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:brightness-110 text-white font-medium rounded-lg transition-all shadow"
                >
                    <Home className="w-5 h-5" />
                    <span>กลับไปหน้าหลัก</span>
                </Link>
                <Link
                    href="javascript:history.back()"
                    className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>กลับไปหน้าก่อนหน้า</span>
                </Link>
            </div>

            {/* Floating Stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-purple-400 opacity-60 animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.max(2, Math.random() * 6)}px`,
                            height: `${Math.max(2, Math.random() * 6)}px`,
                            animationDuration: `${Math.max(2, Math.random() * 8)}s`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Decorative Gradient Floor */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/10 to-transparent dark:from-purple-800/5 z-[-1]" />
        </div>
    );
}
