import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDB } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "chennai-mehendi-art-secret-key-2026";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const db = getDB();

    // Verify Username
    if (username !== db.adminUsername) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Verify Password
    const passwordMatch = bcrypt.compareSync(password, db.adminPasswordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Generate JWT Token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1d" });

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Authentication successful" });
  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
