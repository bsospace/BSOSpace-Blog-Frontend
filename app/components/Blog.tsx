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
  // Function to extract headings from the HTML content
  const extractHeadings = (htmlContent: string) => {
    const headings = htmlContent.match(/<h2>(.*?)<\/h2>/g);
    if (headings) {
      const displayedHeadings = headings.slice(0, 5); // Take only the first 5 headings
      return (
        <>
          {displayedHeadings.map((heading, index) => {
            const title = heading.replace(/<\/?h2>/g, "");
            return (
              <li key={index}>
                <a
                  href={`#section-${index}`}
                  className="text-blue-500 hover:underline"
                >
                  {title}
                </a>
              </li>
            );
          })}
          {headings.length > 5 && <li>...</li>}{" "}
        </>
      );
    }
    return null;
  };

  return (
    <Link href={`/posts/${slug}`} passHref>
      <div className="cursor-pointer rounded-lg shadow-md p-6 max-w-lg hover:shadow-lg bg-white text-gray-900 transition-transform transform dark:bg-gray-800 dark:text-gray-100 dark:hover:shadow-white-500">
        <h2 className="text-2xl font-bold mb-3 hover:underline">{title}</h2>
        <div className="mb-4 text-gray-700 dark:text-gray-300">
          <ul className="list-disc pl-5 space-y-2"></ul>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            Author:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {Author.name}
            </span>
          </p>
          <p>
            Published on:{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          </p>
          <div className="mb-2 pt-4 flex flex-wrap gap-2">
            {tags?.map((tag) => (
              <div
                key={tag.id}
                className="bg-blue-100 text-blue-800 text-[10px] font-medium px-2 py-1 rounded-full border border-blue-200 dark:bg-blue-800 dark:text-blue-300 dark:border-blue-700"
              >
                {tag.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
