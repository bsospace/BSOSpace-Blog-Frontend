"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaCalendar, FaClock, FaUser } from "react-icons/fa";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import ScrollProgressBar from "@/app/components/ScrollProgress";
import { PreviewEditor } from "@/app/components/tiptap-templates/simple/view-editor";
import content from "@/app/components/tiptap-templates/simple/data/content.json";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlignJustify } from "lucide-react";

export default function PostPage({ params }: { params: { slug: string } }) {
    const mockData = {
        header: "My Sample Blog Post",
        description: "This is a sample blog post description that shows how the preview works.",
        image: "https://picsum.photos/800/400",
        tags: ["programming", "typescript", "react", "nextjs"],
        content: content,
        author: "John Doe",
        publishDate: "March 15, 2024",
        readTime: "5 min read"
    };

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <ScrollProgressBar />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 rounded-md">
                {/* Hero Section */}
                <div className="relative bg-white dark:bg-gray-900 rounded-lg">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                            <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
                            <IoChevronForward className="w-4 h-4" />
                            <Link href="/home" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
                            <IoChevronForward className="w-4 h-4" />
                            <span className="text-gray-900 dark:text-white font-medium">{mockData.header}</span>
                        </nav>

                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                                {mockData.header}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                {mockData.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                <div className="flex items-center gap-2"><FaUser /><span>{mockData.author}</span></div>
                                <div className="flex items-center gap-2"><FaCalendar /><span>{mockData.publishDate}</span></div>
                                <div className="flex items-center gap-2"><FaClock /><span>{mockData.readTime}</span></div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {mockData.tags.map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={mockData.image} alt={mockData.header} className="w-full h-64 md:h-96 object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 mb-4">
                                <AlignJustify className="text-gray-900 dark:text-white" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Table of Contents</h3>
                            </div>
                            <Popover>
                                <PopoverTrigger>
                                    <Button variant="outline" size="sm" className="flex items-center gap-2 justify-between w-full bg-white dark:bg-gray-800 text-left dark:text-white">
                                        <span>Show Contents</span>
                                        <IoChevronDown className="w-4 h-4" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 max-h-60 overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                                    <div className="space-y-2">
                                        <a href="#introduction" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded">1. Introduction</a>
                                        <a href="#getting-started" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded">2. Getting Started</a>
                                        <a href="#advanced-topics" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded">3. Advanced Topics</a>
                                        <a href="#conclusion" className="block px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded">4. Conclusion</a>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="prose prose-lg max-w-none dark:prose-invert">
                            <PreviewEditor content={mockData.content} />
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Share this article:</span>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557..." /></svg>
                                        </button>
                                        <button className="p-2 rounded-full bg-blue-800 dark:bg-blue-700 text-white hover:bg-blue-900 dark:hover:bg-blue-800 transition-colors">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452..." /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Bookmark</button>
                                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">Subscribe</button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                    {mockData.author.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About {mockData.author}</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        A passionate developer and writer who loves to share knowledge about modern web development,
                                        React, TypeScript, and best practices in software engineering.
                                    </p>
                                    <div className="mt-3">
                                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                                            Follow {mockData.author} →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}