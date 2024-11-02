"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // You can change the theme if needed
import { Post, Tag, Category } from "@/app/interfaces";
import { useRouter } from "next/navigation";
import { FaEdit, FaSave, FaTag } from "react-icons/fa";
import { fetchPostById } from "@/app/_action/posts.action";
import BackButton from "../../../../components/BackButton";
import Editor from "../../../../components/EditToolBar";

// Load ReactQuill dynamically for client-side only
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
});

// Ensure `highlight.js` is available for ReactQuill
if (typeof window !== "undefined" && window.hljs === undefined) {
  window.hljs = hljs;
}

export default function EditPost({ params }: { params: { id: number } }) {
  const [postData, setPostData] = useState<Post | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const fetchedPost = await fetchPostById(params.id);
        if (fetchedPost) {
          setPostData(fetchedPost);
        }
      } catch (error) {
        console.error("Failed to fetch post data:", error);
        alert("Error loading post data.");
      }
    };

    const fetchTagsAndCategories = async () => {
      try {
        const tagsResponse = await fetch("/api/tags");
        if (!tagsResponse.ok) throw new Error("Failed to fetch tags");
        const tagsData = await tagsResponse.json();
        setTags(tagsData);

        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok)
          throw new Error("Failed to fetch categories");
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch tags and categories:", error);
        alert("Error loading tags or categories.");
      }
    };

    if (params.id) {
      fetchPostData();
    }
    fetchTagsAndCategories();
  }, [params.id]);

  const handleEditorChange = (content: string) => {
    console.log(content);
    
    setPostData((prevData) => ({
      ...prevData!,
      content,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setPostData((prevData) => ({
      ...prevData!,
      [name]: value,
    }));
  };

  const handleTagClick = (tag: Tag) => {
    setPostData((prevData) => {
      const isTagSelected = prevData!.tags.some((t) => t.id === tag.id);
      const newTags = isTagSelected
        ? prevData!.tags.filter((t) => t.id !== tag.id)
        : [...prevData!.tags, tag];
      return {
        ...prevData!,
        tags: newTags,
      };
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!postData?.title) newErrors.title = "Title is required";
    if (!postData?.content) newErrors.content = "Content is required";
    if (!postData?.categoryId) newErrors.categoryId = "Category is required";
    if (postData?.tags.length === 0)
      newErrors.tags = "At least one tag is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const tagIds = postData!.tags.map((tag) => tag.id);

    console.log(postData);
    try {
      const response = await fetch(`/api/posts/edit/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...postData,
          tagIds,
        }),
      });

      if (response.ok) {
        router.push("/admin/posts");
      } else {
        alert("Failed to update post");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update post");
    }
  };

  if (!postData) {
    return (
      <div className=" w-full h-full flex justify-center">
        <p className="loader"></p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex mb-2 items-center space-x-2">
        <BackButton />
        <h1 className="text-2xl font-bold">Edit Post</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            placeholder="Enter title"
            value={postData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title}</p>
          )}
        </div>

        <div>
          <label htmlFor="content" className="block text-gray-700">
            Content <span className="text-red-500">*</span>
          </label>
          <Editor onSubmit={handleEditorChange} value={postData} />
          {/* <ReactQuill
            theme="snow"
            value={postData.content}
            onChange={handleEditorChange}
            modules={{
              syntax: true,
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                [{ align: [] }],
                ["code-block"],
              ],
            }}
          /> */}
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-gray-700">
            key (ถ้าใส่ key โพสต์จะไม่เป็นสาธารณะ)
          </label>
          <input
            type="text"
            name="key"
            id="key"
            placeholder="Enter key"
            value={postData.key}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-gray-700">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="categoryId"
            id="categoryId"
            value={postData.categoryId}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm">{errors.categoryId}</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700">
            Tags <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`px-4 py-2 rounded border ${
                  postData.tags.some((t) => t.id === tag.id)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-200 text-gray-700 border-gray-300"
                }`}
                onClick={() => handleTagClick(tag)}
              >
                <FaTag className="mr-2" />
                {tag.name}
              </button>
            ))}
          </div>
          {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded flex items-center"
        >
          <FaSave className="mr-2" /> Save Changes
        </button>
      </form>
    </div>
  );
}
