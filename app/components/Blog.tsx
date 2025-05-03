/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Post, User, Tag } from "../interfaces";

const BlogCard: React.FC<Post> = ({
  id,
  title,
  description,
  slug,
  thumbnail,
  published_at,
  likes,
  views,
  read_time,
  author,
  tags,
}) => {
  // Date formatting for Thai locale
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Truncate description if it's too long
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Link
      className="block h-full transition-all duration-300 hover:-translate-y-1"
      href={`/posts/${slug}`}
      passHref
    >
      <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-900">
        {/* Thumbnail */}
        {thumbnail && (
            <img
              src={thumbnail}
              alt={title}
              className="object-cover w-full h-48 rounded-t-lg"
            />
        )}

        {/* Content */}
        <div className="flex flex-col flex-grow p-5">
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="mb-3 text-xl font-bold text-gray-900 line-clamp-2 dark:text-white">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="flex-grow mb-4 text-sm text-gray-600 line-clamp-3 dark:text-gray-300">
              {truncateText(description, 150)}
            </p>
          )}

          {/* Meta Information */}
          <div className="mt-auto">
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
              {/* Author Info */}
              <div className="flex items-center">
                {author?.avatar ? (
                  <img
                    src={author.avatar}
                    alt={author.username || "Author"}
                    className="w-8 h-8 mr-2 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 mr-2 text-white bg-blue-500 rounded-full">
                    {author?.username?.charAt(0).toUpperCase() || author?.first_name?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {author?.username || author?.first_name || "Anonymous"}
                </span>
              </div>

              {/* Date */}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(published_at)}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  {views || 0}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                  {likes || 0}
                </span>
              </div>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {read_time || 0} min read
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;