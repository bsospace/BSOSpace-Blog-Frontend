import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../utils/auth";
import prisma from "@/prisma/client";
import { User } from "@prisma/client";

export async function authMiddleware(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token");

    if (!token) {
      // Redirect to login page if no token is found
      const url = new URL("/auth/login", req.url);
      return NextResponse.redirect(url);
    }

    // Verify and decode the token
    const decoded: User | null = verifyToken(token.value) as User | null;

    if (!decoded) {
      // Redirect to login page if token is invalid
      const url = new URL("/auth/login", req.url);
      return NextResponse.redirect(url);
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
      // Redirect to login page if user is not found
      const url = new URL("/auth/login", req.url);
      return NextResponse.redirect(url);
    }

    if (user.role !== "admin") {
      // Redirect to a forbidden page or handle access denial
      const url = new URL("/403", req.url);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error(error);
    // Redirect to an error page or handle internal server error
    const url = new URL("/500", req.url);
    return NextResponse.redirect(url);
  }
}
