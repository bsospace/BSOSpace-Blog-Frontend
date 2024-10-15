import { NextRequest } from "next/server";
import { POST } from "../route";
import prisma from "../../../../../prisma/client";
import { comparePassword, generateToken } from "@/app/utils/auth";

jest.mock("@/app/utils/auth");
jest.mock("../../../../../prisma/client", () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

describe("POST /api/auth/login", () => {
  it("should return 405 if method is not POST", async () => {
    const req = new NextRequest(
      new Request("http://localhost", { method: "GET" })
    );
    const res = await POST(req);
    expect(res.status).toBe(405);
    const json = await res.json();
    expect(json.error).toBe("Method not allowed");
  });

  it("should return 400 if email or password is missing", async () => {
    const req = new NextRequest(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({}),
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Email and password are required");
  });

  it("should return 401 if email or password is invalid", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Invalid email or password");
  });

  it("should return 200 and set auth-token if login is successful", async () => {
    const user = {
      id: 1,
      email: "test@example.com",
      password: "hashedpassword",
      name: "Test User",
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
    (comparePassword as jest.Mock).mockReturnValue(true);
    (generateToken as jest.Mock).mockReturnValue("token");

    const req = new NextRequest(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password",
        }),
      })
    );
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    expect(res.cookies.get("auth-token")?.value).toBe("token");
  });
});
