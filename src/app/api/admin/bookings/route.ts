import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getBookings, updateBookingStatus, getDB, saveDB } from "@/lib/db";
import { sendApprovalEmail } from "@/lib/notifications";

const JWT_SECRET = process.env.JWT_SECRET || "chennai-mehendi-art-secret-key-2026";

// Auth helper
async function isAuthenticated() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    
    if (!token) return false;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return !!decoded;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = getBookings();
    
    // Sort bookings by creation date (newest first)
    const sorted = [...bookings].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ bookings: sorted });
  } catch (err: any) {
    console.error("GET Admin Bookings Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["pending", "accepted", "rejected", "cancelled", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid booking status" }, { status: 400 });
    }

    const currentBooking = getBookings().find((b) => b.id === id);

    // Special fallback: since lowdb/file db doesn't support "completed" separately, we map updates
    const updated = updateBookingStatus(id, status);

    if (!updated) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Send customer approval email only once the admin accepts the booking
    if (status === "accepted" && currentBooking?.status !== "accepted") {
      void sendApprovalEmail(updated);
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (err: any) {
    console.error("PATCH Booking Status Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Support DELETE booking (for clean-up/cancellations)
export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
    }

    const db = getDB();
    const index = db.bookings.findIndex((b) => b.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    db.bookings.splice(index, 1);
    saveDB(db);

    return NextResponse.json({ success: true, message: "Booking deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Booking Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
