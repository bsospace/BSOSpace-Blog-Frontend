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

export async function fetchPosts(
  page: number,
  limit: number
): Promise<{ 
  data: Post[]; 
  pagination: { 
    total_records: number; 
    current_page: number; 
    total_pages: number; 
    next_page: number | null; 
    prev_page: number | null 
  } 
}> {
  try {
    const response = await fetch(
      // todo รอแก้ไขดึงข้อมูลจาก backend เตรียม path ยิงให้แล้ว ?page=${page}&limit=${limit}
      `${process.env.PRODUCTION_URL}/api/posts/all`,
      {
        next: {
          revalidate: 0,
        },
        method: "GET",
      }
    );

    // todo แก้ขัด รอแก้ไขดึงข้อมูลจาก backend แก้อันบนเสร็จแล้วฝากลบอันนี้ทิ้งด้วย
    // pagination และ sort ตามวันที่
    let resData = await response.json();
    let total = resData.length;
    let total_pages = Math.ceil(total / limit);
    let next_page: number | null;
    let prev_page: number | null;
    
    resData.sort((a: Post, b: Post) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    resData = resData.slice((page - 1) * limit, page * limit);

    next_page = page + 1;
    prev_page = page - 1;
    
    return { 
      data: resData, 
      pagination: {
        total_records: total,
        current_page: page,
        total_pages: Math.ceil(total / limit),
        next_page: next_page > total_pages ? null : next_page,
        prev_page: prev_page > 0 ? prev_page : null,
      },
    };
  } catch (error) {
    console.error(error);
  }

  return {
    data: [],
    pagination: {
      total_records: 0,
      current_page: 0,
      total_pages:0,
      next_page: null,
      prev_page: null,
    },
  }
}