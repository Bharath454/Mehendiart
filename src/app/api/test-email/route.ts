import { NextResponse } from "next/server";

// GET /api/test-email?secret=YOUR_JWT_SECRET
// Use this to test if emails work on Vercel
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Basic protection — only allow if correct secret is passed
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY || "";
  const smtpUser = process.env.SMTP_USER || "";
  const adminEmail = process.env.ADMIN_EMAIL || "";

  const config = {
    RESEND_API_KEY: resendKey ? `${resendKey.slice(0, 6)}... (set ✅)` : "NOT SET ❌",
    SMTP_USER: smtpUser || "NOT SET",
    ADMIN_EMAIL: adminEmail || "NOT SET",
    emailService: resendKey.startsWith("re_") ? "Resend" : smtpUser ? "Gmail SMTP" : "NONE ❌",
  };

  // Try sending a real test email
  try {
    const { sendEmailConfirmation } = await import("@/lib/notifications");

    const testBooking = {
      id: "TEST-VERCEL-001",
      _id: "TEST-VERCEL-001",
      name: "Vercel Test Customer",
      mobile: "+91 98400 00000",
      email: adminEmail || smtpUser, // Send test to admin inbox
      eventType: "Wedding",
      packageOrGuest: "guest",
      designType: "Arabic",
      subDesignName: "Half Hand",
      packageName: "",
      date: new Date().toLocaleDateString("en-IN"),
      timeSlot: "10:00 AM",
      address: "Test Address, Chennai",
      price: 150,
      additionalNotes: "This is a Vercel test email.",
      status: "pending",
    } as any;

    await sendEmailConfirmation(testBooking);

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${testBooking.email}`,
      config,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      config,
    }, { status: 500 });
  }
}
