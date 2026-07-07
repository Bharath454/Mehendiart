import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/lib/models";
import { getRefreshToken, createAccessToken, getJWTSecret } from "@/lib/auth";

export async function POST() {
  try {
    getJWTSecret();

    const cookieStore = await cookies();
    const refreshPayload = await getRefreshToken();

    if (!refreshPayload) {
      return NextResponse.json(
        { error: "Refresh token missing or expired. Please log in again.", code: "REFRESH_INVALID" },
        { status: 401 }
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    await connectToDatabase();

    if (refreshPayload.role === "admin") {
      const adminEmail = process.env.ADMIN_EMAIL || refreshPayload.email;

      if (refreshPayload.email.toLowerCase() !== adminEmail.toLowerCase()) {
        return NextResponse.json(
          { error: "Admin credentials changed. Please log in again.", code: "CREDENTIALS_CHANGED" },
          { status: 401 }
        );
      }

      const newAccessToken = createAccessToken({
        email: adminEmail,
        role: "admin",
      });

      cookieStore.set("admin_token", newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 60 * 15,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        role: "admin",
        message: "Token refreshed successfully",
      });
    } else if (refreshPayload.role === "user") {
      // Re-validate user still exists in DB
      const user = await User.findById(refreshPayload.sub);

      if (!user || user.email !== refreshPayload.email) {
        return NextResponse.json(
          { error: "User account not found. Please log in again.", code: "USER_NOT_FOUND" },
          { status: 401 }
        );
      }

      const newAccessToken = createAccessToken({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: "user",
      });

      cookieStore.set("user_token", newAccessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        maxAge: 60 * 15,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        role: "user",
        user: { id: user._id.toString(), name: user.name, email: user.email },
        message: "Token refreshed successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid refresh token role.", code: "REFRESH_INVALID" },
      { status: 401 }
    );
  } catch (err: any) {
    console.error("Refresh Token Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
