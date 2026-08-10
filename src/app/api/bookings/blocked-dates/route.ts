import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Booking } from "@/lib/models";
import { getConfig } from "@/app/api/admin/config/route";

// The 3 fixed daily time slots
const ALL_SLOTS = [
  "08:00 AM - 10:00 AM",
  "01:00 PM - 03:00 PM",
  "06:00 PM - 09:00 PM",
];

// GET /api/bookings/blocked-dates
// Returns dates that are fully booked (all 3 slots taken) OR admin-blocked.
export async function GET() {
  try {
    await connectToDatabase();

    // 1. Get all active bookings (pending or accepted) grouped by date
    const activeBookings = await Booking.find({
      status: { $in: ["pending", "accepted"] },
    }).select("date timeSlot -_id").lean();

    // Build a map: date -> Set of booked slots
    const slotsByDate: Record<string, Set<string>> = {};
    for (const b of activeBookings) {
      if (!slotsByDate[b.date]) slotsByDate[b.date] = new Set();
      slotsByDate[b.date].add(b.timeSlot);
    }

    // A date is fully blocked when all 3 slots are taken
    const fullyBookedDates = Object.entries(slotsByDate)
      .filter(([, slots]) => ALL_SLOTS.every((s) => slots.has(s)))
      .map(([date]) => date);

    // 2. Get admin-blocked dates from Config
    let adminBlockedDates: string[] = [];
    try {
      const config = await getConfig();
      adminBlockedDates = config.blockedDates.map((b: any) => b.date);
    } catch {
      // Config may not exist yet — ignore
    }

    // Merge both lists (deduplicate)
    const allBlockedDates = Array.from(
      new Set([...fullyBookedDates, ...adminBlockedDates])
    );

    return NextResponse.json({ blockedDates: allBlockedDates });
  } catch (err: any) {
    console.error("GET /api/bookings/blocked-dates error:", err);
    return NextResponse.json({ error: "Failed to fetch blocked dates" }, { status: 500 });
  }
}
