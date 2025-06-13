/* eslint-disable @next/next/no-img-element */
"use client";

import React, { FC } from "react";
import Link from "next/link";
import { Post } from "../interfaces";
import { FiBookmark, FiClock, FiEye, FiHeart } from "react-icons/fi";
import { formatDate } from "@/lib/utils";

const BlogCard = ({ post }
  : {
    post: Post;
  } & React.HTMLAttributes<HTMLDivElement>
) => {
  return (
    <div className="group md:max-h-64 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10">

      {/* Animated border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>


      {/* Glowing orb effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      <div className="relative z-10 md:flex h-full flex-col md:flex-row items-start group-hover:scale-105 transition-transform duration-500">
        {/* Thumbnail Section */}
        <div className="relative md:w-2/5 flex-shrink-0">
          <div className="h-full max-h-full overflow-hidden">
            <img
              src={post?.thumbnail || "/default-thumbnail.png"}
              alt={post.title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />
            {/* Tech overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Floating tech elements */}
            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>

          {/* Bookmark with tech styling */}
          <button className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-xl border border-orange-500/30 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-orange-500/20">
            <FiBookmark className="w-4 h-4 text-orange-400" />
          </button>
        </div>

        {/* Content Section */}
        <div className="md:w-3/5 w-full p-6 h-full flex flex-col">
          {/* Tech Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 text-xs font-mono bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 rounded-full border border-orange-500/30 hover:border-orange-400 transition-colors cursor-pointer"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Title with tech styling */}
          <Link
            className="flex w-full hover:underline hover:underline-offset-4 group"
            href={`/posts/@${post.author?.username}/${post.slug}`}
          >
            <h2 className="md:text-xl text-sm  font-bold text-black dark:text-white mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-red-400 group-hover:bg-clip-text transition-all duration-500">
              {post.title}
            </h2>
          </Link>

          {/* Description */}
          <p className="text-slate-300 text-sm mb-4 line-clamp-3 flex-grow leading-relaxed mix-h-full">
            {post.description}
          </p>

          {/* Bottom section */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">

            {/* Author info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={post.author?.avatar || `/default-avatar.png`}
                  alt={post.author?.username || "Author"}
                  className="w-8 h-8 rounded-full object-cover border-2 border-orange-500/50 shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900" />
              </div>

              <div className="leading-snug">
                <p className="text-orange-300 text-sm font-medium m-0 p-0">
                  @{post.author?.username || "ผู้เขียน"}
                </p>
                <p className="text-slate-400 text-xs m-0 p-0">
                  {formatDate(post.published_at ?? '')}
                </p>
              </div>
            </div>


            {/* Stats */}
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <FiClock className="w-4 h-4 text-orange-400" />
                <span>{post.read_time || 0}m</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <FiEye className="w-4 h-4 text-red-400" />
                <span>{(post.views || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <FiHeart className="w-4 h-4 text-pink-400" />
                <span>{post.likes || 0}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
export default BlogCard;