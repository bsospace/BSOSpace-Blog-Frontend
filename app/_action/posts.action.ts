"use client";
import { Meta, Post } from "@/app/interfaces";
import { axiosInstance } from "../utils/api";

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

export interface PostResponse {
  posts: Post[];
  meta: Meta;
}

export async function fetchPosts(
  page: number = 1,
  limit: number = 10,
  search: string = ""
): Promise<{ data: Post[]; meta: Meta }> {
  try {
    const response = await axiosInstance.get<{
      data: PostResponse;
      message: string;
      success: boolean;
    }>(`/posts?page=${page}&limit=${limit}&search=${search}`);

    const raw = response.data.data;

    return {
      data: raw.posts,
      meta: raw.meta,
    };
  } catch (error) {
    console.error("Failed to fetch posts:", error);

    return {
      data: [],
      meta: {
        total: 0,
        hasNextPage: false,
        page: 0,
        limit: 0,
        totalPage: 0,
      },
    };
  }
}