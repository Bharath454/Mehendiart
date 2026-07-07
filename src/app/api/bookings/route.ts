import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Booking } from "@/lib/models";
import { sendEmailConfirmation } from "@/lib/notifications";

// POST /api/bookings (Public Endpoint)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      name,
      mobile,
      email,
      eventType,
      packageOrGuest,
      packageName,
      designType,
      subDesignName,
      price,
      date,
      timeSlot,
      address,
      additionalNotes,
    } = data;

    // Validate required fields
    if (!name || !mobile || !email || !eventType || !packageOrGuest || !price || !date || !timeSlot || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (packageOrGuest === "package" && !packageName) {
      return NextResponse.json({ error: "Package name is required for package bookings" }, { status: 400 });
    }

    if (packageOrGuest === "guest" && (!designType || !subDesignName)) {
      return NextResponse.json({ error: "Design type and sub-design are required for guest bookings" }, { status: 400 });
    }

    await connectToDatabase();

    // Create the booking
    const newBooking = await Booking.create({
      name: String(name).trim(),
      mobile: String(mobile).trim(),
      email: String(email).trim().toLowerCase(),
      eventType: String(eventType).trim(),
      packageOrGuest,
      packageName: packageName ? String(packageName).trim() : undefined,
      designType: designType ? String(designType).trim() : undefined,
      subDesignName: subDesignName ? String(subDesignName).trim() : undefined,
      price: Number(price),
      date: String(date).trim(),
      timeSlot: String(timeSlot).trim(),
      address: String(address).trim(),
      additionalNotes: additionalNotes ? String(additionalNotes).trim() : undefined,
      status: "pending",
    });

    const formattedBooking = newBooking.toObject();
    formattedBooking.id = formattedBooking._id.toString();

    // Send confirmation email asynchronously
    void sendEmailConfirmation(formattedBooking as any);

    return NextResponse.json({
      success: true,
      booking: formattedBooking,
      message: "Booking request submitted successfully!",
    });
  } catch (err: any) {
    console.error("Booking POST error:", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
