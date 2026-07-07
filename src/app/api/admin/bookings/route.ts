import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Booking } from "@/lib/models";
import { sendApprovalEmail } from "@/lib/notifications";
import { requireAdmin, authErrorResponse } from "@/lib/auth";

// GET /api/admin/bookings
export async function GET() {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    await connectToDatabase();
    // Sort bookings by creation date (newest first)
    const bookings = await Booking.find().sort({ createdAt: -1 });

    // Format `_id` to `id` for frontend compatibility
    const formattedBookings = bookings.map((b) => {
      const obj = b.toObject();
      obj.id = obj._id.toString();
      delete obj._id;
      delete obj.__v;
      return obj;
    });

    return NextResponse.json({ bookings: formattedBookings });
  } catch (err: any) {
    console.error("GET Admin Bookings Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/admin/bookings
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!["pending", "accepted", "rejected", "cancelled", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid booking status" }, { status: 400 });
    }

    await connectToDatabase();

    const currentBooking = await Booking.findById(id);
    if (!currentBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const previousStatus = currentBooking.status;
    currentBooking.status = status as any;
    const updated = await currentBooking.save();

    const formattedUpdated = updated.toObject();
    formattedUpdated.id = formattedUpdated._id.toString();

    // Send approval email only when transitioning to accepted
    if (status === "accepted" && previousStatus !== "accepted") {
      void sendApprovalEmail(formattedUpdated as any);
    }

    return NextResponse.json({ success: true, booking: formattedUpdated });
  } catch (err: any) {
    console.error("PATCH Booking Status Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/bookings?id=<id>
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const result = await Booking.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Booking deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Booking Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
