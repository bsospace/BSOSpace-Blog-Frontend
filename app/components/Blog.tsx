/* eslint-disable @next/next/no-img-element */
"use client";

import React, { FC } from "react";
import Link from "next/link";
import { Post } from "../interfaces";
import { FiBookmark, FiClock, FiEye, FiHeart } from "react-icons/fi";

const BlogCard: FC<Post> = ({
  title,
  description,
  slug,
  thumbnail,
  published_at,
  likes,
  views,
  read_time,
  author,
  tags
}) => {
  // Date formatting for Thai locale
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <Link href={`/posts/@${author?.username}/${slug}`} className="block group">
      <div className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-md transition-all duration-300">
        {/* Thumbnail side - takes up less space */}
        <div className="relative w-1/3 flex-shrink-0">
          <div className="h-full aspect-[4/3] overflow-hidden">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Bookmark button - more subtly positioned */}
          <button className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <FiBookmark className="w-3 h-3 text-gray-700 dark:text-gray-200" />
          </button>
        </div>

        {/* Content side - optimized spacing */}
        <div className="w-2/3 p-3 flex flex-col">
          {/* Tags in horizontal inline display */}
          {tags && tags.length > 0 && (
            <div className="md:flex md:flex-wrap hidden gap-1 mb-1">
              {tags.slice(0, 6).map((tag) => (
                <span
                  key={tag.id}
                  className="px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Title - more compact */}
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {title}
          </h2>

          {/* Description - shortened */}
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2 flex-grow">
            {description}
          </p>

          {/* Bottom info row */}
          <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-100 dark:border-gray-700">
            {/* Author info - simplified */}
            <div className="flex items-center">
              <img
                src={author?.avatar || `/api/placeholder/24/24`}
                alt={author?.username || "Author"}
                className="w-5 h-5 rounded-full mr-1.5 object-cover"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {author?.username || "ผู้เขียน"}
              </p>
            </div>

            {/* Stats - more compact */}
            <div className="flex items-center space-x-2">
              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <FiClock className="w-3 h-3 mr-0.5" />
                {read_time || 0}
              </span>
              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <FiEye className="w-3 h-3 mr-0.5" />
                {views || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;