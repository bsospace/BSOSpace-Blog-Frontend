import { Tag } from "../../../interfaces/index";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

// GET handler to fetch a single post by ID
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.pathname.split("/").pop();

  if (!slug) {
    return NextResponse.json({
      success: false,
      message: "slug required!",
    });
  }

  try {
    if (slug !== "all") {
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

      if (post) {
        return NextResponse.json(post);
      } else {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    } else {
      const post = await prisma.post.findMany({
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
        },
      });

      if (post) {
        return NextResponse.json(post);
      } else {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PUT handler to update a post by ID
// export async function PUT(req: NextRequest) {
//   const id = req.nextUrl.searchParams.get("id");
//   const { title, content, author, categoryId } = await req.json();

//   try {
//     const post = await prisma.post.update({
//       where: { id: Number(id) },
//       data: { title, content, author, categoryId: Number(categoryId) },
//     });

//     return NextResponse.json(post);
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }

// DELETE handler to delete a post by ID
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  try {
    await prisma.post.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
