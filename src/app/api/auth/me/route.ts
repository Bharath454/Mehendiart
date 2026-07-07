import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdmin, getUser } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();

    // Check admin token first
    const adminToken = cookieStore.get("admin_token")?.value;
    if (adminToken) {
      const adminPayload = await getAdmin();
      if (adminPayload) {
        return NextResponse.json({
          authenticated: true,
          role: "admin",
          email: adminPayload.email,
        });
      }
      // Token is invalid/expired — clear it
      cookieStore.delete("admin_token");
    }

    // Check user token
    const userToken = cookieStore.get("user_token")?.value;
    if (userToken) {
      const userPayload = await getUser();
      if (userPayload) {
        return NextResponse.json({
          authenticated: true,
          role: "user",
          id: userPayload.id,
          email: userPayload.email,
          name: userPayload.name,
        });
      }
      // Token is invalid/expired — clear it
      cookieStore.delete("user_token");
    }

    return NextResponse.json({ authenticated: false });
  } catch (err: any) {
    console.error("Get Session Error:", err);
    return NextResponse.json({ authenticated: false });
  }
}
