import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { verifyToken } from "@/app/utils/auth";
import { User } from "@prisma/client";

// DELETE handler to delete a post by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: number } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  // Verify and decode the token
  const decoded: User | null = verifyToken(token) as User | null;

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch the post to check ownership
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      select: { authorId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if the user is the owner of the post
    if (post.authorId !== decoded.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this post" },
        { status: 403 }
      );
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: Number(id) },
    });

    // Return a 204 No Content response
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete post", message: error.message },
      { status: 500 }
    );
  }
}
