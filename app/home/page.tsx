'use client';

import { useEffect, useState } from "react";
import { fetchPosts } from "../_action/posts.action";
import BlogCard from "../components/Blog";
import { Post } from "../interfaces";
interface Props {
  posts: Post[];
  error?: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  let error: string | undefined;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const [prevPage, setPrevPage] = useState<number | null>(null);
  const [indexStart, setIndexStart] = useState(0);
  const [indexEnd, setIndexEnd] = useState(5);
  const [total, setTotal] = useState(0);

  async function getPosts() {
    try {
      let temp = await fetchPosts(page, limit);

      setPosts(temp.data);
      setIndexStart((page - 1) * limit + 1);
      setIndexEnd((page * limit > temp.pagination.total_records) ? temp.pagination.total_records : page * limit);
      setTotal(temp.pagination.total_records);
      setNextPage(temp.pagination.next_page);
      setPrevPage(temp.pagination.prev_page);
    } catch (err) {
      error = "Failed to load posts.";
    }
  }

  const handleNext = () => {    
    if (nextPage == null) return;
    setPage(page + 1);
  }

  const handlePrevious = () => {
    if (prevPage == null) return;
    setPage(page - 1);
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.target.value));
  }

  useEffect(() => {
    getPosts();
  }, [limit, page]);

  if (error) {
    return (
      <div className="container mx-auto text-center mt-12">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-bold mb-4">สวัสดีครับ!</h2>
        <p className="text-lg text-gray-700 mb-6">
          บล็อกนี้เกิดมาจากความอยากทำของ{" "}
          <span className="font-semibold">BSO</span>
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">B</span> = Bom |{" "}
          <span className="font-semibold">S</span> = Smart |{" "}
          <span className="font-semibold">O</span> = Ohm
        </p>
        <br />
        <span className="text-lg ">
          แค่บล็อกๆนึงที่เอาไว้ลงสิ่งที่เรารู้แล้วกลัวลืมเฉยๆ
          ไว้ให้เพื่อนๆในสาขาได้อ่านกันด้วย และเรายังมีช่องยูทูปด้วยนะ&nbsp;
          <a
            href="https://www.youtube.com/@BSOSpace"
            className="hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            👉🏻 ดูเราที่ยูทูป
          </a>
        </span>
      </header>

      <section>
        <h3 className="text-3xl font-bold text-gray-800 mb-6">Blogs</h3>
        {/* pagination for blog */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <select className="border border-gray-300 rounded-md px-2 py-1" onChange={handleLimitChange}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </div>
          <div>
            {/* 1 of n posts */}
            <p className="text-gray-500 text-sm">
              {indexStart} - {indexEnd} of {total} posts
            </p>
          </div>
          <div>
            <button onClick={handlePrevious} className={`${prevPage ? "bg-blue-500 text-white" : "bg-[#bfdbfe] text-[#808390]"} px-4 py-2 rounded-md`}>
              Previous
            </button>
            <button onClick={handleNext} className={`${nextPage ? "bg-blue-500 text-white" : "bg-[#bfdbfe] text-[#808390]"} px-4 py-2 rounded-md ml-2`}>
              Next
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <BlogCard
                key={post.id.toString()}
                slug={post.slug}
                id={post.id}
                title={post.title}
                content={post.content}
                Author={post.Author}
                tags={post.tags}
                Category={post.Category}
                createdAt={post.createdAt}
                updatedAt={post.updatedAt}
                authorId={post.authorId}
                categoryId={post.categoryId}
                published={false}
              />
            ))
          ) : (
            <p className="text-lg text-gray-500">No posts available.</p>
          )}
        </div>
      </section>
    </div>
  );
}
