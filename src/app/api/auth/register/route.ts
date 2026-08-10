import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/lib/models";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";

    const limitResult = rateLimit(ip, 3, 60000); // 3 requests per minute
    if (!limitResult.success) {
      return rateLimitResponse(limitResult.remaining, limitResult.resetTime);
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      passwordHash,
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. You can now log in.",
    });
  } catch (err: any) {
    console.error("Registration API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
