import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/auth";
import prisma from "@/prisma/client";
import { User } from "@prisma/client";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token");

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    // Verify and decode the token
    const decoded: User | null = verifyToken(
      token?.value as unknown as string
    ) as User | null;

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if the user exists in the database
    const user = await prisma.user.findFirst({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Respond with user data
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
