import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Booking } from "@/lib/models";

// GET /api/bookings/slots?date=YYYY-MM-DD
// Returns the list of already-booked slots for a given date (pending or accepted bookings).
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "A valid date (YYYY-MM-DD) is required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const bookings = await Booking.find({
      date,
      status: { $in: ["pending", "accepted"] },
    }).select("timeSlot -_id").lean();

    const bookedSlots = bookings.map((b) => b.timeSlot);

    return NextResponse.json({ bookedSlots });
  } catch (err: any) {
    console.error("GET /api/bookings/slots error:", err);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
