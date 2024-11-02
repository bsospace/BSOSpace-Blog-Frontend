
"use client";

import { useState, useContext, useEffect } from "react";

// Extend the Window interface to include hljs
declare global {
  interface Window {
    hljs: typeof hljs;
  }
}

import dynamic from "next/dynamic"; // ใช้ dynamic เพื่อลดปัญหาการโหลด
import "react-quill/dist/quill.snow.css"; // นำเข้าธีมของ React Quill
import hljs from "highlight.js"; // นำเข้า highlight.js
import "highlight.js/styles/github.css"; // นำเข้าธีมของ highlight.js
import { Post, Tag, Category } from "@/app/interfaces";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/contexts/authContext";
import TurndownService from "turndown"; // สำหรับแปลง HTML เป็น Markdown
import BackButton from '../../../components/BackButton';
import Editor from "../../../components/EditToolBar";

// โหลด ReactQuill แบบ dynamic เพื่อให้ทำงานบน client side เท่านั้น
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false, // ปิดการใช้งาน Server-Side Rendering (SSR)
});

// เปิดใช้งาน highlight.js ก่อนที่จะใช้ Quill
if (typeof window !== "undefined") {
  window.hljs = hljs;
}

export default function CreatePost() {
  const [postData, setPostData] = useState<Post>({
    id: 0,
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
    title: "",
    slug: "",
    content: "",
    key: "",
    published: false,
    Category: { 
      id: 0, 
      name: "", 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    },
    tags: [],
    authorId: 0,
    categoryId: 0,
    Author: {
      id: 0,
      name: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      email: "",
    },
  });
  
  const editorValue = {
    ...postData,
    createdAt: new Date(postData.createdAt),
    updatedAt: new Date(postData.updatedAt),
    Author: {
      ...postData.Author,
      createdAt: new Date(postData.Author.createdAt),
      updatedAt: new Date(postData.Author.updatedAt),
    },
    Category: {
      ...postData.Category,
      createdAt: new Date(postData.Category.createdAt),
      updatedAt: new Date(postData.Category.updatedAt),
    },
    tags: postData.tags.map(tag => ({
      ...tag,
      createdAt: new Date(tag.createdAt),
      updatedAt: new Date(tag.updatedAt),
    })),
  };

  
  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { isLoggedIn, isFecthing } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
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

    fetchTagsAndCategories();
  }, []);

  const handleEditorChange = (content: string) => {
    console.log(content);
    setPostData((prevData) => ({
      ...prevData,
      content,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value: originalValue } = e.target;
    let value = originalValue;

    // ปรับเปลี่ยนค่าของฟิลด์ "key"
    if (name === "key" && value !== "") {
      value = value.replace(/[^a-zA-Z0-9]/g, "-");
    }

    setPostData((prevData) => ({
      ...prevData!,
      [name]: value,
    }));
  };

  const handleTagClick = (tag: Tag) => {
    setPostData((prevData) => {
      const isTagSelected = prevData.tags.some((t) => t.id === tag.id);
      const newTags = isTagSelected
        ? prevData.tags.filter((t) => t.id !== tag.id)
        : [...prevData.tags, tag];
      return {
        ...prevData,
        tags: newTags,
      };
    });
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!postData.title) newErrors.title = "Title is required";
    if (!postData.content) newErrors.content = "Content is required";
    if (!postData.categoryId) newErrors.categoryId = "Category is required";
    if (postData.tags.length === 0)
      newErrors.tags = "At least one tag is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    // จัดเตรียม tagIds จาก tags ที่เลือก
    const tagIds = postData.tags.map((tag) => tag.id);

    try {
      const response = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...postData,
          tagIds,
        }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        alert("Failed to create post");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to create post");
    }
  };

  useEffect(() => {
    if (!isLoggedIn && !isFecthing) {
      router.push("/auth/login");
    }
  }, [isLoggedIn, isFecthing, router]);

  // ฟังก์ชันดาวน์โหลดเป็น Markdown
  const downloadMarkdown = () => {
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(postData.content);

    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${postData.title || "post"}.md`;
    link.click();
  };

  // ฟังก์ชันดาวน์โหลดเป็น HTML
  const downloadHTML = () => {
    const blob = new Blob([postData.content], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${postData.title || "post"}.html`;
    link.click();
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex mb-2 items-center space-x-2">
        <BackButton />
        <h1 className="text-2xl font-bold">Create New Post</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ส่วน Title */}
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

        {/* ส่วน Content */}
        <div>
          <label htmlFor="content" className="block text-gray-700">
            Content <span className="text-red-500">*</span>
          </label>
          < Editor onSubmit={handleEditorChange} value={editorValue} />
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

        {/* ส่วน Category */}
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

        {/* ส่วน Tags */}
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
                {tag.name}
              </button>
            ))}
          </div>
          {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
        </div>

        {/* ปุ่มสร้างโพสต์ */}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Post
        </button>
      </form>

      {/* l */}
      <div></div>

      {/* ปุ่มดาวน์โหลด */}
      <div className="mt-6">
        <button
          onClick={downloadMarkdown}
          className="px-4 py-2 bg-green-600 text-white rounded mr-4"
        >
          Download as Markdown
        </button>
        <button
          onClick={downloadHTML}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Download as HTML
        </button>
      </div>
    </div>
  );
}
