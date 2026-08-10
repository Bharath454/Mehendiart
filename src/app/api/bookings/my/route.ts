import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Booking } from "@/lib/models";
import { requireUser } from "@/lib/auth";

// GET /api/bookings/my
// Returns a list of bookings matching the logged-in user's email
export async function GET() {
  try {
    const user = await requireUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const userBookings = await Booking.find({
      email: user.email.toLowerCase().trim()
    }).sort({ createdAt: -1 });

    const formatted = userBookings.map((b) => {
      const obj = b.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    return NextResponse.json({ bookings: formatted });
  } catch (err: any) {
    if (err?.name === "UnauthorizedError" || err?.name === "TokenExpiredError" || err?.name === "TokenInvalidError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET My Bookings Error:", err);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// PATCH /api/bookings/my
// Allows user to cancel their own booking (only if it is currently pending)
export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify ownership
    if (booking.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Verify status is pending before permitting cancellation
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending bookings can be cancelled. Please contact us directly for modifications." },
        { status: 400 }
      );
    }

    booking.status = "cancelled";
    await booking.save();

    const formatted = booking.toObject();
    formatted.id = formatted._id.toString();

    return NextResponse.json({ success: true, booking: formatted });
  } catch (err: any) {
    if (err?.name === "UnauthorizedError" || err?.name === "TokenExpiredError" || err?.name === "TokenInvalidError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH My Booking Error:", err);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
