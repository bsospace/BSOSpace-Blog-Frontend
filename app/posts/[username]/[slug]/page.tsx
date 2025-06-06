/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */

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
import { JSONContent } from "@tiptap/react";
import { axiosInstance } from "@/app/utils/api";
import { Post } from "@/app/interfaces";
import { SEOProvider } from "@/app/contexts/seoContext";

export default function PostPage({ params }: { params: { slug: string, username: string } }) {

    const [isLoading, setIsLoading] = useState(true);
    const [contentState, setContentState] = useState<JSONContent>();
    const [post, setPost] = useState<Post | null>(null);

    const [metadata, setMetadata] = useState({
        title: "Loading...",
        description: "Loading...",
        image: "https://picsum.photos/800/400",
        author: '',
        authorImage: '',
        publishDate: '',
        readTime: '0 min read'
    });


    const fetchContent = async (username: string, slug: string) => {
        try {

            console.log("Fetching content for:", username, slug);

            const response = await axiosInstance.get(`/posts/public/${username}/${slug}`);
            if (response.status === 200) {
                const post = response.data.data as Post;
                const parsedContent = JSON.parse(post.content);
                setContentState(parsedContent);
                setPost(post);

                console.log("Post content fetched successfully:", post.title);
                if (post.title) {
                    setMetadata({
                        ...metadata,
                        title: post.title,
                        description: post.description || "",
                        image: post.thumbnail || "https://picsum.photos/800/400",
                        author: post.author?.username || "Unknown Author",
                        authorImage: post.author?.avatar || "https://picsum.photos/50/50",
                        publishDate: post.published_at ? new Date(post.published_at).toLocaleDateString() : "Not Published",
                        readTime: post.read_time ? `${post.read_time} min read` : "0 min read"
                    })
                }
                setIsLoading(false);
            }

        } catch (error) {
            console.error("Error fetching content:", error);
            // Handle error appropriately, e.g., show a message to the user
        }
    }

    useEffect(() => {
        const { username, slug } = params;
        if (username && slug) {

            console.log("Fetching content for:", username, slug);
            const decodedSlug = decodeURIComponent(slug);
            const cleanUsername = username.replace('%40', '')

            console.log("Decoded slug:", decodedSlug);
            console.log("Cleaned username:", cleanUsername);
            fetchContent(cleanUsername, decodedSlug);
        } else {
            setIsLoading(false);
        }
    }, [params]);

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
                            <span className="text-gray-900 dark:text-white font-medium truncate">{metadata.title}</span>
                        </nav>

                        <div className="mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight break-words">
                                {metadata.title}
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                {metadata.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                <div className="flex items-center gap-2"><FaUser /><span>{metadata.author}</span></div>
                                <div className="flex items-center gap-2"><FaCalendar /><span>{metadata.publishDate}</span></div>
                                <div className="flex items-center gap-2"><FaClock /><span>{metadata.readTime}</span></div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {/* {metadata.tags.map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                        #{tag}
                                    </span>
                                ))} */}
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img src={metadata.image} alt={metadata.title} className="w-full h-64 md:h-96 object-cover" />
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
                            <PreviewEditor content={contentState ?? { type: 'doc', content: [] }} />
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
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                                    {metadata.authorImage ? <img src={metadata.authorImage} alt={metadata.author} className="w-full h-full rounded-full object-cover" /> : (metadata.author?.charAt(0) || 'A')}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About {metadata.author}</h4>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                        A passionate developer and writer who loves to share knowledge about modern web development,
                                        React, TypeScript, and best practices in software engineering.
                                    </p>
                                    <div className="mt-3">
                                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                                            Follow {metadata.author} →
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