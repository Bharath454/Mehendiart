import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Booking, BridalPackage, GuestDesign } from "@/lib/models";
import { sendEmailConfirmation, notifyOwnerOnBooking } from "@/lib/notifications";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

// POST /api/bookings (Public Endpoint)
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";

    const limitResult = rateLimit(ip, 5, 60000); // 5 requests per minute
    if (!limitResult.success) {
      return rateLimitResponse(limitResult.remaining, limitResult.resetTime);
    }

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
      date,
      timeSlot,
      address,
      additionalNotes,
    } = data;

    // Validate required fields
    if (!name || !mobile || !email || !eventType || !packageOrGuest || !date || !timeSlot || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (packageOrGuest === "package" && !packageName) {
      return NextResponse.json({ error: "Package name is required for package bookings" }, { status: 400 });
    }

    if (packageOrGuest === "guest" && (!designType || !subDesignName)) {
      return NextResponse.json({ error: "Design type and sub-design are required for guest bookings" }, { status: 400 });
    }

    await connectToDatabase();

    // Compute price server-side based on selection
    let price = 0;
    if (packageOrGuest === "package" && packageName) {
      const dbPackage = await BridalPackage.findOne({ name: packageName });
      if (dbPackage) {
        price = dbPackage.price;
      } else {
        const PACKAGE_PRICES: Record<string, number> = {
          "Bridal Package 1 (Basic)": 3500,
          "Bridal Package 2 (Standard)": 4000,
          "Bridal Package 3 (Grand Royal)": 4500,
          "Bridal Package 1": 3500,
          "Bridal Package 2": 4000,
          "Bridal Package 3": 4500,
        };
        price = PACKAGE_PRICES[packageName] ?? 0;
      }
    } else if (packageOrGuest === "guest" && designType && subDesignName) {
      const dbDesign = await GuestDesign.findOne({ name: subDesignName, type: designType });
      if (dbDesign) {
        price = dbDesign.price;
      } else {
        const ARABIC_PRICES: Record<string, number> = {
          Palm: 50, Wrist: 100, "Half Hand": 150, Elbow: 250,
          "Arabic Palm Design": 50, "Arabic Wrist Design": 100, "Arabic Half Hand": 150, "Arabic Elbow Length": 250,
        };
        const INDIAN_PRICES: Record<string, number> = {
          Palm: 100, Wrist: 150, "Half Hand": 250, "3/4 Hand": 350, Elbow: 450,
          "Indian Palm Design": 100, "Indian Wrist Design": 150, "Indian Half Hand": 250, "Indian 3/4 Hand": 350, "Indian Elbow Length": 450,
        };
        price = designType === "Arabic"
          ? (ARABIC_PRICES[subDesignName] ?? 0)
          : (INDIAN_PRICES[subDesignName] ?? 0);
      }
    }

    // Guard: Check if the same date + timeSlot is already taken (by any booking type)
    const existingSlot = await Booking.findOne({
      date: String(date).trim(),
      timeSlot: String(timeSlot).trim(),
      status: { $in: ["pending", "accepted"] },
    });
    if (existingSlot) {
      return NextResponse.json(
        { error: "This time slot is already booked for the selected date. Please choose a different slot or date." },
        { status: 409 }
      );
    }

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

    // Send both emails in parallel and WAIT for them before returning.
    // IMPORTANT: On Vercel serverless, using `void` (fire-and-forget) causes
    // the function to terminate before the second email sends. We must await both.
    await Promise.all([
      sendEmailConfirmation(formattedBooking as any),
      notifyOwnerOnBooking(formattedBooking as any),
    ]);

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
