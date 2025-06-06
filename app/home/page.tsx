/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { fetchPosts } from "../_action/posts.action";
import BlogCard from "../components/Blog";
import { Post } from "../interfaces";
import { FiCode, FiCpu, FiSearch, FiTrendingUp, FiZap } from "react-icons/fi";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [hasNextPage, setHasNextPage] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const getPosts = useCallback(async (newPage = page) => {
    try {
      if (newPage === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetchPosts(newPage, limit, searchQuery);

      setPosts(res.data);
      setHasNextPage(res.meta.hasNextPage);

    } catch (err) {
      console.error("Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, limit, searchQuery]);

  const getPopularPosts = useCallback(async () => {
    try {
      setLoadingPopular(true);
      const res = await fetchPosts(1, 5);
      setPopularPosts(res.data);
    } catch (err) {
      console.error("Failed to load popular posts");
    } finally {
      setLoadingPopular(false);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !loadingMore) {
          setLimit((prevLimit) => prevLimit + 5);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasNextPage, loadingMore]);

  useEffect(() => {
    getPosts();
    getPopularPosts();
  }, [page, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <header className="text-center mb-16 relative">
          {/* Background tech elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-20 right-1/4 w-48 h-48 bg-gradient-to-br from-red-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex justify-center items-center mb-6">
              <FiCode className="w-8 h-8 text-orange-400 mr-3" />
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                Be Simple but Outstanding
              </h1>
              <FiCpu className="w-8 h-8 text-red-400 ml-3" />
            </div>

            {/* Tech search bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาบทความ..."
                  className="w-full p-4 pl-12 pr-6 rounded-2xl bg-slate-800/50 backdrop-blur-md border border-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => {
                    setPage(1);
                    setSearchQuery(e.target.value);
                  }}
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-400" />

                {/* Search button */}
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-xl text-white font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                  <FiZap className="w-4 h-4" />
                </button>
              </div>

              {/* Animated border */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 rounded-2xl blur-sm opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <FiTrendingUp className="w-6 h-6 text-orange-400 mr-3" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Latest From the BSO Blog
              </h2>
            </div>
          </div>

          {/* Blog Posts */}
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-10 w-full flex justify-center border-b dark:border-none shadow-sm rounded-md min-h-48 h-full bg-slate-800/50 p-6 text-gray-900 transition-transform transform dark:text-gray-100">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))
            ) : (
              <p className="text-lg text-slate-400 text-center py-10">
                ไม่พบบทความ
              </p>
            )}

            <div ref={observerRef} className="text-center py-10 w-full flex justify-center">
              {loadingMore && (
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
