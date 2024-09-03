"use server";
import { Post } from "@/app/interfaces";

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${process.env.PRODUCTION_URL}/api/posts/${slug}`, {
      next: {
        revalidate: 0,
      },
      method: "GET",
    });
    const data: Post = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchPostById(id: number): Promise<Post | null> {
  try {
    const res = await fetch(`${process.env.PRODUCTION_URL}/api/posts/id/${id}`, {
      next: {
        revalidate: 0,
      },
      method: "GET",
    });
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
      `${process.env.PRODUCTION_URL}/api/posts/all`,
      {
        next: {
          revalidate: 0,
        },
        method: "GET",
      }
    );
    return response.json();
  } catch (error) {
    console.error(error);
  }

  return [];
}
