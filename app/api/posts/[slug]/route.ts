import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import jwt, { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "@/app/utils/auth";

// GET handler to fetch posts by slug or by user ID if slug is 'mypost'
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.pathname.split("/").pop();
  const token = req.cookies.get("auth-token")?.value;
  if (!slug) {
    return NextResponse.json({
      success: false,
      message: "Slug required!",
    });
  }

  try {
    if (slug === "my-posts") {
      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      // Decode user ID from token
      const user = verifyToken(token) || null;

      // Fetch posts created by the logged-in user
      const posts = await prisma.post.findMany({
        where: {
          authorId: user?.id, // Add null check
        },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          Category: true,
          Author: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
      });

      return posts.length > 0
        ? NextResponse.json(posts)
        : NextResponse.json({ error: "No posts found" }, { status: 404 });
    } else if (slug !== "all") {
      // Fetch a specific post by slug
      const post = await prisma.post.findUnique({
        where: { slug: slug },
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
    } else {
      // Fetch all posts
      const posts = await prisma.post.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          Category: true,
          Author: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
          },
        },
      });

      return posts.length > 0
        ? NextResponse.json(posts)
        : NextResponse.json({ error: "No posts found" }, { status: 404 });
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
