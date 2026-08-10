import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Inquiry } from "@/lib/models";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit";

// GET /api/inquiries — Admin only
export async function GET() {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    await connectToDatabase();
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });

    const formattedInquiries = inquiries.map((i) => {
      const obj = i.toObject();
      obj.id = obj._id.toString();
      delete obj._id;
      delete obj.__v;
      return obj;
    });

    return NextResponse.json({ success: true, inquiries: formattedInquiries });
  } catch (err: any) {
    console.error("GET Inquiries Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/inquiries — Public (contact form submission)
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
               request.headers.get("x-real-ip") || 
               "127.0.0.1";

    const limitResult = rateLimit(ip, 3, 60000); // 3 requests per minute
    if (!limitResult.success) {
      return rateLimitResponse(limitResult.remaining, limitResult.resetTime);
    }

    const { name, email, mobile, message } = await request.json();

    if (!name || !email || !mobile || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Basic input sanitization
    const sanitized = {
      name: String(name).trim().slice(0, 100),
      email: String(email).trim().toLowerCase().slice(0, 200),
      mobile: String(mobile).trim().replace(/\D/g, "").slice(0, 15),
      message: String(message).trim().slice(0, 2000),
    };

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitized.email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Mobile format validation
    if (sanitized.mobile.length < 10) {
      return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
    }

    await connectToDatabase();

    const newInquiry = await Inquiry.create(sanitized);
    
    const formattedInquiry = newInquiry.toObject();
    formattedInquiry.id = formattedInquiry._id.toString();

    return NextResponse.json({ success: true, inquiry: formattedInquiry });
  } catch (err: any) {
    console.error("POST Inquiry Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
