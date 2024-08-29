"use server";
import { Post } from "@/app/interfaces";

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}`,
      {
        next: { revalidate: 60 },
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
        next: { revalidate: 60 },
        cache: "no-store",
      }
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }

  return [];
}
