"use client";
import { useEffect, useState, useContext, useRef } from "react";
import { Post } from "@/app/interfaces";
import { fetchPostBySlug } from "@/app/_action/posts.action";
import Link from "next/link";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { useSearchParams } from "next/navigation";
import { FaBars, FaLock, FaCalendar, FaClock, FaUser } from "react-icons/fa";
import {
    Popover,
    PopoverHandler,
    PopoverContent,
    Button,
    PopoverContentProps,
} from "@material-tailwind/react";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import ScrollProgressBar from "@/app/components/ScrollProgress";
import { PreviewEditor } from "@/app/components/tiptap-templates/simple/view-editor";
import content from "@/app/components/tiptap-templates/simple/data/content.json";

export default function PostPage({ params }: { params: { slug: string } }) {
    const mockData = {
        header: "My Sample Blog Post",
        description: "This is a sample blog post description that shows how the preview works.",
        image: "https://picsum.photos/800/400", // Using placeholder image
        tags: ["programming", "typescript", "react", "nextjs"],
        content: content, // Using your existing content import
        author: "John Doe",
        publishDate: "March 15, 2024",
        readTime: "5 min read"
    };

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

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

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section */}
                <div className="relative bg-white rounded-lg">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                            <Link href="/" className="hover:text-blue-600 transition-colors">
                                Home
                            </Link>
                            <IoChevronForward className="w-4 h-4" />
                            <Link href="/blog" className="hover:text-blue-600 transition-colors">
                                Blog
                            </Link>
                            <IoChevronForward className="w-4 h-4" />
                            <span className="text-gray-900 font-medium">
                                {mockData.header}
                            </span>
                        </nav>

                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                {mockData.header}
                            </h1>

                            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                                {mockData.description}
                            </p>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                                <div className="flex items-center gap-2">
                                    <FaUser className="w-4 h-4" />
                                    <span>{mockData.author}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaCalendar className="w-4 h-4" />
                                    <span>{mockData.publishDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaClock className="w-4 h-4" />
                                    <span>{mockData.readTime}</span>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                {mockData.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Featured Image */}
                        <div className="mb-8">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src={mockData.image}
                                    alt={mockData.header}
                                    className="w-full h-64 md:h-96 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white">
                    <div className="container mx-auto px-4 py-8 max-w-4xl">
                        {/* Table of Contents */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-4">
                                <FaBars className="w-4 h-4 text-gray-600" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Table of Contents
                                </h3>
                            </div>

                            <Popover>
                                <PopoverHandler>
                                    <Button
                                        variant="outlined"
                                        className="flex items-center gap-2 text-left justify-between w-full"
                                    >
                                        <span>Show Contents</span>
                                        <IoChevronDown className="w-4 h-4" />
                                    </Button>
                                </PopoverHandler>
                                <PopoverContent className="w-80 max-h-60 overflow-y-auto">
                                    <div className="space-y-2">
                                        <a href="#introduction" className="block px-3 py-2 text-sm hover:bg-gray-100 rounded">
                                            1. Introduction
                                        </a>
                                        <a href="#getting-started" className="block px-3 py-2 text-sm hover:bg-gray-100 rounded">
                                            2. Getting Started
                                        </a>
                                        <a href="#advanced-topics" className="block px-3 py-2 text-sm hover:bg-gray-100 rounded">
                                            3. Advanced Topics
                                        </a>
                                        <a href="#conclusion" className="block px-3 py-2 text-sm hover:bg-gray-100 rounded">
                                            4. Conclusion
                                        </a>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Content Editor */}
                        <div className="prose prose-lg max-w-none">
                            <PreviewEditor content={mockData.content} />
                        </div>

                        {/* Social Share & Actions */}
                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600">Share this article:</span>
                                    <div className="flex gap-2">
                                        <button className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                            </svg>
                                        </button>
                                        <button className="p-2 rounded-full bg-blue-800 text-white hover:bg-blue-900 transition-colors">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                        Bookmark
                                    </button>
                                    <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Author Bio */}
                        <div className="mt-12 p-6 bg-gray-50 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                    {mockData.author.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                        About {mockData.author}
                                    </h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        A passionate developer and writer who loves to share knowledge about modern web development,
                                        React, TypeScript, and best practices in software engineering. Always exploring new technologies
                                        and helping others grow in their coding journey.
                                    </p>
                                    <div className="mt-3">
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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