"use server";
import { Post } from "@/app/interfaces";

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}`,
      {
        cache: "no-cache",
      }
    );
    const data: Post = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchPosts(): Promise<Post[] | []> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts`,
      {
        cache: "no-cache",
      }
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }

  return [];
}
