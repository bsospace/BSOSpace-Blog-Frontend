"use client";

import { useState, useContext, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Post, Tag, Category } from "@/app/interfaces";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/contexts/authContext";

export default function CreatePost() {
  const [postData, setPostData] = useState<Post>({
    id: 0,
    createdAt: "",
    updatedAt: "",
    title: "",
    slug: "",
    content: "",
    key: "",
    published: false,
    Category: { id: 0, name: "", createdAt: "", updatedAt: "" },
    tags: [],
    authorId: 0,
    categoryId: 0,
    Author: {
      id: 0,
      name: "",
      createdAt: "",
      updatedAt: "",
      email: "",
    },
  });

  const [tags, setTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const editorApiKey = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;
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
    setPostData((prevData) => ({
      ...prevData,
      content,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value: originalValue } = e.target;
    let value = originalValue;

    // Modify the value if the field is "key"
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

    // Prepare tagIds from selected tags
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

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
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
          <Editor
            apiKey={editorApiKey}
            init={{
              height: 300,
              menubar: true,
              plugins: [
                "a11ychecker",
                "advcode",
                "advlist",
                "anchor",
                "autolink",
                "codesample",
                "fullscreen",
                "help",
                "image",
                "editimage",
                "tinydrive",
                "lists",
                "link",
                "media",
                "powerpaste",
                "preview",
                "searchreplace",
                "table",
                "tinymcespellchecker",
                "visualblocks",
                "wordcount",
              ],
              toolbar: [
                "insertfile a11ycheck undo redo | bold italic | forecolor backcolor | codesample | alignleft aligncenter alignright alignjustify | bullist numlist | link image",
              ],
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
            }}
            onEditorChange={handleEditorChange}
          />
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
                {tag.name}
              </button>
            ))}
          </div>
          {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Create Post
        </button>
      </form>
    </div>
  );
}
