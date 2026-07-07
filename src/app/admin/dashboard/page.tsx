import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import AdminDashboard from "@/components/AdminDashboard";

const JWT_SECRET = process.env.JWT_SECRET || "chennai-mehendi-art-secret-key-2026";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  // Server-side redirect if cookie token is missing
  if (!token) {
    redirect("/admin/login");
  }

  // Server-side redirect if JWT validation fails
  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
