import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import AdminDashboard from "@/components/AdminDashboard";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  // Server-side redirect if cookie token is missing
  if (!token) {
    redirect("/login");
  }

  // Server-side redirect if JWT validation fails or role is not admin
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[FATAL] JWT_SECRET not set on server");
      redirect("/login");
    }

    const decoded = jwt.verify(token, secret) as any;

    // Strictly verify this is an admin token
    if (!decoded || decoded.role !== "admin") {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  return <AdminDashboard />;
}
