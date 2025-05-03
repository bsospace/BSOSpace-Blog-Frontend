/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { fetchPosts } from "../_action/posts.action";
import BlogCard from "../components/Blog";
import { Post } from "../interfaces";
import { FiSearch } from "react-icons/fi";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
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
          setPage((prev) => prev + 1);
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
    <div className="container mx-auto">
      <header className="h-full mb-12 flex justify-center items-center flex-col">
        <h1 className="text-heading-2-medium md:my-24 mb-4 mt-12 md:text-hero-bold font-bold text-center bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 dark:from-purple-400 dark:via-pink-500 dark:to-orange-400 bg-clip-text text-transparent">
          Be Simple but Outstanding
        </h1>

        <div className="relative mt-6 w-full max-w-lg shadow-sm dark:hover:shadow-white-500">
          <input
            type="text"
            placeholder="ค้นหาบทความ"
            className="w-full p-3 pl-10 rounded-md dark:bg-[#4A4A4A] dark:text-gray-100 focus:outline-none"
            value={searchQuery}
            onChange={(e) => {
              setPage(1);
              setSearchQuery(e.target.value);
            }}
          />
          <div className="absolute left-3 top-4">
            <FiSearch
              className="w-4 h-4"
              style={{
                background: "linear-gradient(90deg, #9499FF 0%, #E7AF65 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            />
          </div>
        </div>
      </header>

      <section className="flex gap-4 w-full">
        <div className="md:w-3/4 w-full">
          <h3 className="md:text-heading-4-medium py-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 dark:from-purple-400 dark:via-pink-500 dark:to-orange-400 bg-clip-text text-transparent">
              #
            </span>
            Latest From the BSO Blog
          </h3>

          <div className="w-full flex flex-col gap-4">
            {loading ? (
              <div className="text-center py-10 w-full flex justify-center border-b dark:border-none shadow-sm rounded-md min-h-48 h-full bg-white p-6 text-gray-900 transition-transform transform dark:bg-[#1F1F1F] dark:text-gray-100 dark:hover:shadow-white-500">
                <div className="loader"></div>
              </div>
            ) : posts && posts.length > 0 ? (
              posts?.map((post) => (
                <BlogCard key={post.id} {...post} published={true} />
              ))
            ) : (
              <p className="text-lg text-gray-500 text-center">
                No posts available.
              </p>
            )}

            <div ref={observerRef} className="text-center py-10 w-full flex justify-center">
              {loadingMore && <div className="loader smooth-loader"></div>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
