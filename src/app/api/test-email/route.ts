import { NextResponse } from "next/server";

// GET /api/test-email?secret=YOUR_JWT_SECRET
// Use this to test if emails work on Vercel or locally
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Basic protection — only allow if correct secret is passed
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY || "";
  const smtpUser = process.env.SMTP_USER || "";
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return NextResponse.json({
      success: false,
      error: "ADMIN_EMAIL environment variable is not set. Add it in Vercel → Settings → Environment Variables.",
    }, { status: 500 });
  }

  // Detect real service in use
  const RESEND_PLACEHOLDERS = ["re_your_api_key_here", "re_placeholder", "re_xxxxxxxxxxxx"];
  const resendReal = resendKey.startsWith("re_") && resendKey.length > 20 && !RESEND_PLACEHOLDERS.includes(resendKey);
  const smtpReal = !!(smtpUser && (process.env.SMTP_PASS || "").replace(/\s+/g,"").length >= 16);

  const config = {
    ADMIN_EMAIL: adminEmail,
    RESEND_API_KEY: resendReal ? `${resendKey.slice(0, 8)}... ✅ REAL KEY` : "❌ Not configured / placeholder",
    SMTP_USER: smtpReal ? `${smtpUser} ✅` : smtpUser ? `${smtpUser} ❌ (App Password invalid/short)` : "❌ Not set",
    emailService: resendReal ? "Resend ✅" : smtpReal ? "Gmail SMTP ✅" : "❌ NONE — emails will NOT send!",
  };

  // Try sending a real test email to the admin inbox
  try {
    const { sendEmailConfirmation } = await import("@/lib/notifications");

    const testBooking = {
      id: "TEST-001",
      _id: "TEST-001",
      name: "Test Customer",
      mobile: "9840792693",
      email: adminEmail, // Send test to admin so they can verify
      eventType: "Wedding",
      packageOrGuest: "guest",
      designType: "Arabic",
      subDesignName: "Half Hand",
      packageName: "",
      date: new Date().toLocaleDateString("en-IN"),
      timeSlot: "10:00 AM",
      address: "No:42/87, Angappan Naicke Street, Chennai",
      price: 150,
      additionalNotes: "This is a test email to verify email delivery is working.",
      status: "pending",
    } as any;

    await sendEmailConfirmation(testBooking);

    return NextResponse.json({
      success: true,
      message: `✅ Test email sent to ${adminEmail} — check inbox!`,
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

