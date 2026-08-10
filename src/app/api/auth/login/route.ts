import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongoose";
import { Config, User } from "@/lib/models";
import { getJWTSecret, createAccessToken, createRefreshToken } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";

    const limitResult = rateLimit(ip, 5, 60000); // 5 requests per minute
    if (!limitResult.success) {
      return rateLimitResponse(limitResult.remaining, limitResult.resetTime);
    }

    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    getJWTSecret();

    await connectToDatabase();
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    if (role === "admin") {
      let config = await Config.findOne();
      if (!config) {
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

      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        return NextResponse.json(
          { error: "Server Configuration Error: ADMIN_EMAIL is not set" },
          { status: 500 }
        );
      }

      if (email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
        return NextResponse.json(
          { error: "Invalid admin email or password" },
          { status: 401 }
        );
      }

      let isMatch = false;

      if (config.adminPasswordHash) {
        isMatch = bcrypt.compareSync(password, config.adminPasswordHash);
      }

      if (!isMatch && process.env.ADMIN_PASSWORD) {
        if (password === process.env.ADMIN_PASSWORD) {
          isMatch = true;
          const hash = bcrypt.hashSync(password, 12);
          config.adminPasswordHash = hash;
          await config.save();
        }
      }

      if (!isMatch) {
        return NextResponse.json(
          { error: "Invalid admin email or password" },
          { status: 401 }
        );
      }

      const accessToken = createAccessToken({ email: adminEmail, role: "admin" });
      const refreshToken = createRefreshToken({
        sub: "admin",
        role: "admin",
        email: adminEmail,
      });

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
        role: "admin",
        message: "Admin authenticated successfully",
      });
    } else {
      // User Login
      const user = await User.findOne({ email: email.toLowerCase().trim() });

      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      const accessToken = createAccessToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: "user",
      });

      const refreshToken = createRefreshToken({
        sub: user._id.toString(),
        role: "user",
        email: user.email,
        name: user.name,
      });

      cookieStore.set("user_token", accessToken, {
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
        role: "user",
        user: { id: user._id.toString(), name: user.name, email: user.email },
        message: "User authenticated successfully",
      });
    }
  } catch (err: any) {
    if (err?.message?.includes("JWT_SECRET")) {
      console.error("[FATAL] JWT_SECRET not configured:", err.message);
      return NextResponse.json(
        { error: "Server configuration error. Contact administrator." },
        { status: 500 }
      );
    }
    console.error("Login API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
