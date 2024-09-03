"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/app/interfaces";
import { FaEdit } from "react-icons/fa";
import Link from "next/link";
import { FaPlusCircle, FaTrashAlt } from "react-icons/fa";
export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/posts/my-posts`);
        if (!response.ok) throw new Error("Failed to fetch posts");
        const postsData = await response.json();
        setPosts(postsData);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        alert("Error loading posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleEdit = (postId: number) => {
    router.push(`/admin/posts/edit/${postId}`);
  };

  const handleDelete = async (postId: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const response = await fetch(`/api/posts/delete/${postId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setPosts(posts.filter((post) => post.id !== postId));
          alert("Post deleted successfully");
        } else {
          alert("Failed to delete post");
        }
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Error deleting post.");
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <h1 className="text-3xl font-bold mb-2 text-center">Manage Posts</h1>
        <Link
          href={`/admin/posts/create`}
          passHref
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded flex items-center"
        >
          <FaPlusCircle className="mr-2" /> new post
        </Link>
      </div>
      {loading ? (
        <div className=" w-full h-full flex justify-center">
          <p className="loader"></p>
        </div>
      ) : (
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="p-4 border-b border-gray-200">{post.title}</td>
                  <td className="p-4 border-b border-gray-200">
                    {post.Category.name}
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    <button
                      onClick={() => handleEdit(post.id)}
                      className="px-4 py-2 mr-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded inline-flex items-center"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded inline-flex items-center"
                    >
                      <FaTrashAlt className="mr-2" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No posts available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
