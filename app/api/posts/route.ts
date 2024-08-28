import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest & { params: { id: string } }) {
  try {
    const post = await prisma.post.findMany({
      include: {
        Author: true,
        Category: true,
        tags: true,
      },
    });

    if (post) {
      return NextResponse.json(post);
    } else {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
