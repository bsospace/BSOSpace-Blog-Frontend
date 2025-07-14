"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaCalendar, FaClock, FaUser } from "react-icons/fa";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import ScrollProgressBar from "@/app/components/ScrollProgress";
import { PreviewEditor, DynamicPreviewEditor } from "@/app/components/tiptap-templates/simple/view-editor";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlignJustify } from "lucide-react";
import { JSONContent } from "@tiptap/react";
import { Post } from "@/app/interfaces";
import { toast } from "@/hooks/use-toast";
import NotFound from "@/app/components/NotFound";
import { SEOProvider } from "@/app/contexts/seoContext";
import Loading from "@/app/components/Loading";
import BlogAIChat from "@/app/components/ai-chat";
import { generateStructuredData } from '@/app/utils/seo';
import Image from "next/image";

interface PostClientProps {
  post: Post;
  isLoadingPost: boolean
}

export default function PostClient({ post, isLoadingPost }: PostClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [contentState, setContentState] = useState<JSONContent>();
  const [toc, setToc] = useState<{ level: number; text: string; href: string }[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [metadata, setMetadata] = useState({
    title: "Loading...",
    description: "Loading...",
    image: "/default-thumbnail.png",
    author: "Unknown Author",
    authorImage: "/default-avatar.png",
    authorBio: "No bio available",
    publishDate: "Not Published",
    readTime: "0 min read"
  });

  const [currentURL, setCurrentURL] = useState<string | null>(null);
  const [structuredData, setStructuredData] = useState<string>('');

  // Client-side detection
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update metadata when post changes
  useEffect(() => {
    if (post) {
      setMetadata({
        title: post.title || "No Title",
        description: post.description || "No description available",
        image: post.thumbnail || "/default-thumbnail.png",
        author: post.author?.username || "Unknown Author",
        authorImage: post.author?.avatar || "/default-avatar.png",
        authorBio: post.author?.bio || "No bio available",
        publishDate: post.published_at ? new Date(post.published_at).toLocaleDateString() : "Not Published",
        readTime: post.read_time ? `${post.read_time} min read` : "0 min read"
      });
    }
  }, [post]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fullURL = `${window.location.origin}/posts/${post.author?.username}/${post.slug}`;
      setCurrentURL(fullURL);
    }
  }, [post.author?.username, post.slug]);

  useEffect(() => {
    if (metadata.title && metadata.description && currentURL) {
      const data = generateStructuredData({
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        url: currentURL,
        type: 'article',
        author: metadata.author,
        publishedTime: post?.published_at ?? undefined,
        modifiedTime: post?.updated_at ?? undefined,
        tags: post?.tags?.map(tag => typeof tag === 'string' ? tag : tag.name || '') || [],
      });
      setStructuredData(JSON.stringify(data));
    }
  }, [metadata, currentURL, post]);

  useEffect(() => {
    if (!post?.content) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    try {
      const parsedContent = JSON.parse(post.content);
      setContentState(parsedContent);
      setIsLoading(false);
      setNotFound(false);
      setToc(generateTableOfContents(parsedContent));
    } catch (e) {
      // Fallback content แทนที่จะ setNotFound
      setContentState({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Content could not be loaded. Please try refreshing the page.'
              }
            ]
          }
        ]
      });
      setIsLoading(false);
      setNotFound(false); // ไม่ setNotFound เพื่อให้แสดง fallback content
    }
  }, [post]);

  function generateTableOfContents(contentState: JSONContent): {
    level: number;
    text: string;
    href: string;
  }[] {
    const toc: {
      level: number;
      text: string;
      href: string;
    }[] = [];
    contentState?.content?.forEach((block) => {
      if (block.type === "heading" && block.attrs && [2, 3, 4].includes(block.attrs.level)) {
        const text = block.content?.map((c) => c.text).join("") || "";
        const slug = "#" + text.trim().toLowerCase().replace(/\s+/g, "-");
        toc.push({ level: block.attrs.level, text, href: slug });
      }
    });
    return toc;
  }

  const seoData = {
    title: metadata.title,
    description: metadata.description,
    image: metadata.image,
    url: currentURL ?? "",
  };

  // Show loading until client-side is ready
  if (!isClient || isLoading) {
    return <Loading label="Loading post..." />;
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NotFound />
      </div>
    );
  }

  return (
    <SEOProvider value={seoData}>
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
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight break-words">
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
                <Image 
                  src={metadata.image} 
                  alt={metadata.title} 
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-96 object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900">
          <div className="container mx-auto py-8 max-w-4xl">
            {/* {
              toc.length > 0 && (
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
                        {toc.map((item, index) => (
                          <Link href={item.href} key={index} className={`block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${item.level === 2 ? 'pl-4' : item.level === 3 ? 'pl-6' : ''}`}>
                            <span className={`text-sm ${item.level === 2 ? 'font-semibold' : item.level === 3 ? 'font-medium' : 'font-normal'}`}>{item.text}</span>
                          </Link>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )
            } */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {isClient && contentState && (
                <DynamicPreviewEditor content={contentState} />
              )}
            </div>
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              {/* <div className="flex flex-wrap items-center justify-between gap-4">
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
              </div> */}
            </div>
            <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                  {metadata.authorImage ? (
                    <Image
                      src={metadata.authorImage}
                      alt={metadata.author}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    metadata.author?.charAt(0) || 'A'
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About {metadata.author}</h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {metadata.authorBio}
                  </p>
                  <div className="mt-3">
                    <button className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium">
                      Follow {metadata.author} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {post?.ai_chat_open && post.ai_ready && (
        <BlogAIChat Post={post} />
      )}
    </SEOProvider>
  );
} 