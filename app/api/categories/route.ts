import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany();

    if (categories) {
      return NextResponse.json(categories);
    } else {
      return NextResponse.json(
        { error: "No categories found" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
