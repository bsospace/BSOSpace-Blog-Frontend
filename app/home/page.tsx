import { fetchPosts } from "../_action/posts.action";
import BlogCard from "../components/Blog";
import { Post } from "../interfaces";

interface Props {
  posts: Post[];
  error?: string;
}

export default async function HomePage() {
  let posts: Post[] = [];
  let error: string | undefined;

  try {
    posts = await fetchPosts();
  } catch (err) {
    error = "Failed to load posts.";
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <BlogCard
                key={post.id}
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
