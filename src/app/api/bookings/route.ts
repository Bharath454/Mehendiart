import { NextResponse } from "next/server";
import { getBookings, getBlockedDates, addBooking, getPricing } from "@/lib/db";
import { notifyOwnerOnBooking, sendEmailConfirmation } from "@/lib/notifications";

export async function GET() {
  try {
    const bookings = getBookings();
    const blockedHolidays = getBlockedDates();

    // Map booked dates (status is pending or accepted)
    const bookedDates = bookings
      .filter((b) => b.status === "pending" || b.status === "accepted")
      .map((b) => b.date);

    // Map blocked holiday dates
    const holidayDates = blockedHolidays.map((h) => h.date);

    // Merge and filter unique dates
    const allBlockedDates = Array.from(new Set([...bookedDates, ...holidayDates]));

    return NextResponse.json({ blockedDates: allBlockedDates });
  } catch (err: unknown) {
    console.error("GET Bookings Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
    } = body;

    // 1. Validation
    if (!name || !mobile || !email || !eventType || !date || !timeSlot || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bookings = getBookings();
    const blockedHolidays = getBlockedDates();

    // 2. Prevent Double Booking
    const isBooked = bookings.some(
      (b) => b.date === date && (b.status === "pending" || b.status === "accepted")
    );
    const isHoliday = blockedHolidays.some((h) => h.date === date);

    if (isBooked || isHoliday) {
      return NextResponse.json(
        { error: "The selected date is no longer available. Please select another date." },
        { status: 400 }
      );
    }

    // 3. Calculate Price from current DB pricing config
    const pricing = getPricing();
    let calculatedPrice = 0;

    if (packageOrGuest === "package") {
      if (packageName.includes("Package 1")) {
        calculatedPrice = pricing.bridal.package1;
      } else if (packageName.includes("Package 2")) {
        calculatedPrice = pricing.bridal.package2;
      } else if (packageName.includes("Package 3")) {
        calculatedPrice = pricing.bridal.package3;
      } else {
        return NextResponse.json({ error: "Invalid Bridal Package selected" }, { status: 400 });
      }
    } else if (packageOrGuest === "guest") {
      if (designType === "Arabic") {
        const area = subDesignName.toLowerCase();
        if (area.includes("palm")) calculatedPrice = pricing.arabic.palm;
        else if (area.includes("wrist")) calculatedPrice = pricing.arabic.wrist;
        else if (area.includes("half")) calculatedPrice = pricing.arabic.halfHand;
        else if (area.includes("elbow")) calculatedPrice = pricing.arabic.elbow;
        else return NextResponse.json({ error: "Invalid Arabic design area" }, { status: 400 });
      } else if (designType === "Indian") {
        const area = subDesignName.toLowerCase();
        if (area.includes("palm")) calculatedPrice = pricing.indian.palm;
        else if (area.includes("wrist")) calculatedPrice = pricing.indian.wrist;
        else if (area.includes("half")) calculatedPrice = pricing.indian.halfHand;
        else if (area.includes("3/4") || area.includes("three")) calculatedPrice = pricing.indian.threeQuarterHand;
        else if (area.includes("elbow")) calculatedPrice = pricing.indian.elbow;
        else return NextResponse.json({ error: "Invalid Indian design area" }, { status: 400 });
      } else {
        return NextResponse.json({ error: "Invalid design type" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Invalid service type" }, { status: 400 });
    }

    // 4. Save Booking to DB
    const newBooking = addBooking({
      name,
      mobile,
      email,
      eventType,
      packageOrGuest,
      packageName,
      designType,
      subDesignName,
      price: calculatedPrice,
      date,
      timeSlot,
      address,
      additionalNotes,
    });

    // 5. Notify owner only; customer email is sent after admin approval
    notifyOwnerOnBooking(newBooking);
    void sendEmailConfirmation(newBooking);

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (err: unknown) {
    console.error("POST Booking Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
