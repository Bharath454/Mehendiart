import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDB, saveDB, getPricing, getBlockedDates, getOffers } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "chennai-mehendi-art-secret-key-2026";

async function isAuthenticated() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    
    if (!token) return false;
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return !!decoded;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pricing = getPricing();
    const blockedDates = getBlockedDates();
    const offers = getOffers();

    return NextResponse.json({ pricing, blockedDates, offers });
  } catch (err: any) {
    console.error("GET Admin Config Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    const db = getDB();

    if (action === "toggle_block_date") {
      const { date, reason } = body;
      if (!date) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 });
      }

      const index = db.blockedDates.findIndex((b) => b.date === date);
      if (index !== -1) {
        db.blockedDates.splice(index, 1); // Unblock
      } else {
        db.blockedDates.push({ date, reason: reason || "Admin Blocked / Personal Holiday" }); // Block
      }
      saveDB(db);
      return NextResponse.json({ success: true, blockedDates: db.blockedDates });
    }

    if (action === "update_pricing") {
      const { pricing } = body;
      if (!pricing || !pricing.bridal || !pricing.arabic || !pricing.indian) {
        return NextResponse.json({ error: "Invalid pricing configuration object" }, { status: 400 });
      }

      db.pricing = pricing;
      saveDB(db);
      return NextResponse.json({ success: true, pricing: db.pricing });
    }

    if (action === "add_offer") {
      const { title, description, code, discountPercent } = body;
      if (!title || !code || !discountPercent) {
        return NextResponse.json({ error: "Title, coupon code, and discount percent are required" }, { status: 400 });
      }

      const newOffer = {
        id: `off-${Date.now()}`,
        title,
        description: description || "",
        code: code.toUpperCase(),
        discountPercent: Number(discountPercent),
        active: true,
      };

      db.offers.push(newOffer);
      saveDB(db);
      return NextResponse.json({ success: true, offer: newOffer });
    }

    if (action === "toggle_offer") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
      }

      const index = db.offers.findIndex((o) => o.id === id);
      if (index === -1) {
        return NextResponse.json({ error: "Offer not found" }, { status: 404 });
      }

      db.offers[index].active = !db.offers[index].active;
      saveDB(db);
      return NextResponse.json({ success: true, offer: db.offers[index] });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST Admin Config Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
