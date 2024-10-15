import { NextRequest, NextResponse } from "next/server";
import { GET } from "../route";
import { verifyToken } from "@/app/utils/auth";
import prisma from "../../../../../prisma/client";
import { User } from "@prisma/client";

jest.mock("@/app/utils/auth");
jest.mock("../../../../../prisma/client", () => ({
  user: {
    findFirst: jest.fn(),
  },
}));

// Correctly mock NextResponse.json to return a mock response object with status
jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  NextResponse: {
    json: jest.fn((data, init) => {
      return { ...init, json: data, status: init?.status || 200 };
    }),
  },
}));

describe("GET /api/auth/check", () => {
  let req: NextRequest;

  beforeEach(() => {
    req = {
      cookies: {
        get: jest.fn(),
      },
    } as unknown as NextRequest;

    jest.clearAllMocks(); // Clear all mocks to prevent test contamination
  });

  it("should return 401 if no token is found", async () => {
    (req.cookies.get as jest.Mock).mockReturnValue(undefined);

    const response = await GET(req);

    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "No token found" },
      { status: 401 }
    );
  });

  it("should return 401 if token is invalid", async () => {
    (req.cookies.get as jest.Mock).mockReturnValue({ value: "invalid-token" });
    (verifyToken as jest.Mock).mockReturnValue(null);

    const response = await GET(req);

    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Invalid token" },
      { status: 401 }
    );
  });

  it("should return 401 if user is not found", async () => {
    const decodedUser: Partial<User> = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "user",
    };
    (req.cookies.get as jest.Mock).mockReturnValue({ value: "valid-token" });
    (verifyToken as jest.Mock).mockReturnValue(decodedUser);
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

    const response = await GET(req);

    expect(response.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "User not found" },
      { status: 401 }
    );
  });

  it("should return 200 with user data if token and user are valid", async () => {
    const decodedUser: Partial<User> = {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "user",
    };
    const user = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "user",
    };
    (req.cookies.get as jest.Mock).mockReturnValue({ value: "valid-token" });
    (verifyToken as jest.Mock).mockReturnValue(decodedUser);
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(user);

    const response = await GET(req);

    expect(response.status).toBe(200);
    expect(NextResponse.json).toHaveBeenCalledWith({ user }, { status: 200 });
  });

  it("should return 500 if there is an internal server error", async () => {
    (req.cookies.get as jest.Mock).mockReturnValue({ value: "valid-token" });
    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error("Internal server error");
    });

    const response = await GET(req);

    expect(response.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  });
});
