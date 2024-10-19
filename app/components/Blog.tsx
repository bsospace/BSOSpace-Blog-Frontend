"use client";
import React from "react";
import Link from "next/link";
import { Post } from "../interfaces";

const BlogCard: React.FC<Post> = ({
  id,
  title,
  content,
  Author,
  slug,
  tags,
  createdAt,
}) => {
  // Date formatting options
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Link
      className=" border-b dark:border-none shadow-sm  rounded-md min-h-48 h-full bg-white  p-6 text-gray-900 transition-transform transform dark:bg-[#1F1F1F] dark:text-gray-100 dark:hover:shadow-white-500"
      href={`/posts/${slug}`}
      passHref
    >
      <div className="cursor-pointer rounded-lg flex flex-col justify-between h-full">
        {/* Title */}
        <h2 className="text-2xl font-bold mb-3 hover:underline line-clamp-3">
          {title}
        </h2>

        {/* Author and Date */}
        <div className="text-sm text-gray-500 dark:text-gray-400 "></div>

        <div className="flex justify-between">
          <p>
            <span className=" text-gray-500 dark:text-gray-300">
              {formatDate(createdAt)}
            </span>
          </p>
          <p>
            <span className=" text-gray-500 dark:text-gray-300">
              {Author.name}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
