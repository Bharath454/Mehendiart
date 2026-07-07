import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongoose";
import { Config } from "@/lib/models";
import { getJWTSecret, createAccessToken, createRefreshToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const JWT_SECRET = getJWTSecret();
    void JWT_SECRET;

    await connectToDatabase();
    
    // Fetch the config singleton to check admin credentials
    let config = await Config.findOne();
    if (!config) {
       // If no config exists, create it (we should have a default seeding mechanism later)
       config = await Config.create({
         blockedDates: [],
         pricing: {
           bridal: { package1: 3500, package2: 4000, package3: 4500 },
           arabic: { palm: 50, wrist: 100, halfHand: 150, elbow: 250 },
           indian: { palm: 100, wrist: 150, halfHand: 250, threeQuarterHand: 350, elbow: 450 }
         },
         offers: [],
         adminPasswordHash: ""
       });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "shahirabanu1706@gmail.com";

    // Verify email
    if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    let passwordMatch = false;

    if (config.adminPasswordHash) {
      passwordMatch = bcrypt.compareSync(password, config.adminPasswordHash);
    }

    // Fallback: if no hash stored yet, compare against env and store hash
    if (!passwordMatch && process.env.ADMIN_PASSWORD) {
      if (password === process.env.ADMIN_PASSWORD) {
        passwordMatch = true;
        const hash = bcrypt.hashSync(password, 12);
        config.adminPasswordHash = hash;
        await config.save();
      }
    }

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const accessToken = createAccessToken({ email: adminEmail, role: "admin" });
    const refreshToken = createRefreshToken({
      sub: "admin",
      role: "admin",
      email: adminEmail,
    });

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    cookieStore.set("admin_token", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 60 * 15, // 15 minutes
      path: "/",
    });

    cookieStore.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/api/auth/refresh",
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      role: "admin",
    });
  } catch (err: any) {
    if (err?.message?.includes("JWT_SECRET")) {
      console.error("[FATAL] JWT_SECRET not configured:", err.message);
      return NextResponse.json(
        { error: "Server configuration error. Contact administrator." },
        { status: 500 }
      );
    }
    console.error("Admin Login API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
