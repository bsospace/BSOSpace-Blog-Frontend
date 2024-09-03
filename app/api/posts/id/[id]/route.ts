import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

// GET handler to fetch a post by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        Author: {
          select: { name: true },
        },
        Category: true,
        tags: true,
      },
    });

    return post
      ? NextResponse.json(post)
      : NextResponse.json({ error: "Post not found" }, { status: 404 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
