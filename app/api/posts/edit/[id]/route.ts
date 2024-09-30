import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { slugify } from "@/app/utils/slugify";

// PUT handler to update a post by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    const { title, content, categoryId, tagIds, key } = await req.json();

    if (!title || !content || !categoryId) {
      return NextResponse.json(
        { error: "Title, content, and category are required" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = slugify(title);

    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
        slug,
        published: key != null || key != undefined ? false : true,
        key: key || null,
        categoryId: parseInt(categoryId),
        tags: {
          set: [],
          connect: tagIds.map((id: number) => ({ id })),
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update post", message: error?.message },
      { status: 500 }
    );
  }
}
