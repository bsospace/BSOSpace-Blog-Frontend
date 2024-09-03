import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { verifyToken } from "@/app/utils/auth";
import { v4 as uuidv4 } from "uuid";

// Handler for POST requests to create a post
export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const { title, content, categoryId, tagIds } = await req.json();

  const token = req.cookies.get("auth-token");

  if (!token) {
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  // Verify and decode the token
  const decoded: User | null = verifyToken(
    token?.value as unknown as string
  ) as User | null;

  if (!decoded) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tagsArray = tagIds || [];

  // Check if the title contains non-English characters
  const isNonEnglish = /[^\x00-\x7F]/.test(title);

  // Generate initial slug based on the title or UUID if non-English
  let slug = isNonEnglish ? uuidv4() : title.toLowerCase().replace(/ /g, "-");

  // Validate if the slug already exists in the database
  let existingPost = await prisma.post.findUnique({
    where: { slug },
  });

  // If the slug exists, append a UUID to ensure uniqueness
  if (existingPost) {
    slug = `${slug}-${uuidv4()}`;
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        authorId: decoded?.id,
        categoryId: parseInt(categoryId),
        tags: {
          connect: tagsArray.map((id: number) => ({ id })),
        },
      },
    });
    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create post", message: error.message },
      { status: 500 }
    );
  }
}
