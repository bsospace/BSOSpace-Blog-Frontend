"use server";
import { Post } from "@/app/interfaces";

export async function fetchPostBySlug(slug: string, key: string = "") {
  try {
    const url = new URL(`${process.env.PRODUCTION_URL}/api/posts/${slug}`);

    if (key) {
      url.searchParams.append("key", key);
    }

    const res = await fetch(url.toString(), {
      next: {
        revalidate: 0,
      },
      method: "GET",
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchPostById(id: number): Promise<Post | null> {
  try {
    const res = await fetch(
      `${process.env.PRODUCTION_URL}/api/posts/id/${id}`,
      {
        next: {
          revalidate: 0,
        },
        method: "GET",
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
