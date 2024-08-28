import BlogCard from "./components/Blog";
import { Post } from "./interfaces";

const HomePage = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`);

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  const posts: Post[] = await response.json();

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">Welcome to BSO Space Blog</h2>
      <p>
        This is a blog where I share my thoughts and ideas about space and
        technology.
      </p>
      <div className="border mt-12 mb-2"></div>
      <div className="text-[2rem] font-bold mb-6">Blogs</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
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
        ))}
      </div>
    </>
  );
};

export default HomePage;
