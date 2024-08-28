import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const tags = await prisma.tag.findMany();

    if (tags) {
      return NextResponse.json(tags);
    } else {
      return NextResponse.json({ error: "No tags found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
