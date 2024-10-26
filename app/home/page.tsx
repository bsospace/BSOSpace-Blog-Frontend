/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { fetchPosts } from "../_action/posts.action";
import BlogCard from "../components/Blog";
import { Post } from "../interfaces";
import { FiSearch } from "react-icons/fi";

export default function HomePage() {
  // Posts data
  const [posts, setPosts] = useState<Post[]>([]);

  // Popular posts data
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);

  // Loading states for popular posts
  const [loadingPopular, setLoadingPopular] = useState(true);

  // Loading state for infinite scrolling
  const [loadingMore, setLoadingMore] = useState(false);

  // Search query state
  const [searchQuery, setSearchQuery] = useState("");

  // Error state
  let error: string | undefined;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [prevPage, setPrevPage] = useState<number | null>(null);
  const [total, setTotal] = useState(0);

  // Ref for observing the loader at the bottom
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Debounced getPosts function for smoother fetching
  const getPosts = useCallback(
    async (newPage = page) => {
      try {
        if (newPage === 1) setLoading(true);
        else setLoadingMore(true);

        let temp = await fetchPosts(newPage, limit);

        if (newPage === 1) {
          // Set the new posts if it's the first page
          setPosts(temp.data);
        } else {
          // Append new posts to the existing posts array
          setPosts((prevPosts) => [...prevPosts, ...temp.data]);
        }

        setTotal(temp.pagination.total_records);
        setNextPage(temp.pagination.next_page);
        setPrevPage(temp.pagination.prev_page);
      } catch (err) {
        error = "Failed to load posts.";
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [page, limit]
  );

  async function getPopularPosts() {
    try {
      setLoadingPopular(true);
      const tempPopular = await fetchPosts(1, 5);
      setPopularPosts(tempPopular.data);
    } catch (err) {
      console.error("Failed to load popular posts.");
    } finally {
      setLoadingPopular(false);
    }
  }

  // Intersection Observer to detect when the loader at the bottom becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage !== null && !loadingMore) {
          setPage((prevPage) => prevPage + 1);
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
  }, [nextPage, loadingMore]);

  useEffect(() => {
    getPosts();
    getPopularPosts();
  }, [page, limit]);

  if (error) {
    return (
      <div className="container mx-auto text-center mt-12">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto">
      <header className="mb-12 h-64 flex justify-center items-center flex-col">
        <h1 className="text-heading-2-medium my-4 md:text-hero-bold font-bold text-center bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 dark:from-purple-400 dark:via-pink-500 dark:to-orange-400 bg-clip-text text-transparent">
          Be Simple but Outstanding
        </h1>

        {/* Search Bar */}
        <div className="relative mt-6 w-full max-w-lg">
          <input
            type="text"
            placeholder="ค้นหาบทความ"
            className="w-full p-3 pl-10 rounded-md dark:bg-[#4A4A4A] dark:text-gray-100 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Magnifying Glass Icon */}
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

          <div className="w-full justify-between flex gap-4">
            <div className="w-full flex gap-4 flex-col transition-all">
              {/* Show custom loader if loading */}
              {loading ? (
                <div className="text-center py-10 w-full flex justify-center  border-b dark:border-none shadow-sm  rounded-md min-h-48 h-full bg-white  p-6 text-gray-900 transition-transform transform dark:bg-[#1F1F1F] dark:text-gray-100 dark:hover:shadow-white-500">
                  <div className="loader"></div>
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <BlogCard
                    key={post.id.toString()}
                    slug={post.slug}
                    id={post.id}
                    title={post.title}
                    content={post.content}
                    Author={post.Author}
                    tags={post.tags}
                    Category={post.Category}
                    createdAt={post.createdAt}
                    updatedAt={post.updatedAt}
                    authorId={post.authorId}
                    categoryId={post.categoryId}
                    published={false}
                  />
                ))
              ) : (
                <p className="text-lg text-gray-500 text-center">
                  No posts available.
                </p>
              )}
              {/* Bottom loader for infinite scrolling */}
              <div
                ref={observerRef}
                className="text-center py-10 w-full flex justify-center"
              >
                {loadingMore && <div className="loader smooth-loader"></div>}
              </div>
            </div>
          </div>
        </div>

        <div className="w-1/4 hidden md:block">
          <h3 className="text-heading-4-medium py-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 dark:from-purple-400 dark:via-pink-500 dark:to-orange-400 bg-clip-text text-transparent">
              #
            </span>
            Popular
          </h3>
          <div className="cursor-pointer bg-white rounded-lg shadow-sm p-6  text-gray-900 transition-transform transform dark:bg-[#1F1F1F] dark:text-gray-100 dark:hover:shadow-white-500">
            {loadingPopular ? (
              <div className="text-center min-h-36 py-10 w-full flex justify-center">
                <div className="loader"></div>
              </div>
            ) : popularPosts.length > 0 ? (
              <ul>
                {popularPosts.map((post) => (
                  <li key={post.id.toString()} className="mb-4">
                    <a
                      href={`/posts/${post.slug}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline line-clamp-2"
                    >
                      {post.title}
                    </a>
                    <p className="text-sm text-gray-500">{post.Author.name}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg text-gray-500">
                No popular posts available.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
