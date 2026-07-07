import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Config, IConfig } from "@/lib/models";
import { requireAdmin, authErrorResponse } from "@/lib/auth";

// Helper to get or create the singleton config document
export async function getConfig(): Promise<IConfig> {
  await connectToDatabase();
  let config = await Config.findOne();
  if (!config) {
    config = await Config.create({
      blockedDates: [],
      pricing: {
        bridal: { package1: 3500, package2: 4000, package3: 4500 },
        arabic: { palm: 50, wrist: 100, halfHand: 150, elbow: 250 },
        indian: { palm: 100, wrist: 150, halfHand: 250, threeQuarterHand: 350, elbow: 450 }
      },
      offers: [],
      adminPasswordHash: ""
    });
  }
  return config;
}

// GET /api/admin/config
export async function GET() {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const config = await getConfig();

    return NextResponse.json({ 
      pricing: config.pricing, 
      blockedDates: config.blockedDates, 
      offers: config.offers 
    });
  } catch (err: any) {
    console.error("GET Admin Config Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/config
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const body = await request.json();
    const { action } = body;

    const config = await getConfig();

    if (action === "toggle_block_date") {
      const { date, reason } = body;
      if (!date) {
        return NextResponse.json({ error: "Date is required" }, { status: 400 });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: "Invalid date format. Expected YYYY-MM-DD" }, { status: 400 });
      }

      const index = config.blockedDates.findIndex((b: any) => b.date === date);
      if (index !== -1) {
        config.blockedDates.splice(index, 1);
      } else {
        config.blockedDates.push({
          date,
          reason: reason?.trim() || "Admin Blocked / Personal Holiday",
        });
      }
      await config.save();
      return NextResponse.json({ success: true, blockedDates: config.blockedDates });
    }

    if (action === "update_pricing") {
      const { pricing } = body;
      if (!pricing || !pricing.bridal || !pricing.arabic || !pricing.indian) {
        return NextResponse.json(
          { error: "Invalid pricing configuration object" },
          { status: 400 }
        );
      }

      const validatePrices = (obj: Record<string, any>): boolean =>
        Object.values(obj).every((v) =>
          typeof v === "object" ? validatePrices(v) : typeof v === "number" && v >= 0
        );

      if (!validatePrices(pricing)) {
        return NextResponse.json(
          { error: "All prices must be non-negative numbers" },
          { status: 400 }
        );
      }

      config.pricing = pricing;
      await config.save();
      return NextResponse.json({ success: true, pricing: config.pricing });
    }

    if (action === "add_offer") {
      const { title, description, code, discountPercent } = body;
      if (!title || !code || !discountPercent) {
        return NextResponse.json(
          { error: "Title, coupon code, and discount percent are required" },
          { status: 400 }
        );
      }

      const discount = Number(discountPercent);
      if (isNaN(discount) || discount < 1 || discount > 100) {
        return NextResponse.json(
          { error: "Discount percent must be between 1 and 100" },
          { status: 400 }
        );
      }

      const upperCode = code.toUpperCase().trim();

      const exists = config.offers.some((o: any) => o.code === upperCode);
      if (exists) {
        return NextResponse.json(
          { error: "A coupon with this code already exists" },
          { status: 409 }
        );
      }

      const newOffer = {
        id: `off-${Date.now()}`,
        title: title.trim(),
        description: description?.trim() || "",
        code: upperCode,
        discountPercent: discount,
        active: true,
      };

      config.offers.push(newOffer);
      await config.save();
      return NextResponse.json({ success: true, offer: newOffer });
    }

    if (action === "toggle_offer") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
      }

      const index = config.offers.findIndex((o: any) => o.id === id);
      if (index === -1) {
        return NextResponse.json({ error: "Offer not found" }, { status: 404 });
      }

      config.offers[index].active = !config.offers[index].active;
      await config.save();
      return NextResponse.json({ success: true, offer: config.offers[index] });
    }

    if (action === "delete_offer") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
      }

      const index = config.offers.findIndex((o: any) => o.id === id);
      if (index === -1) {
        return NextResponse.json({ error: "Offer not found" }, { status: 404 });
      }

      config.offers.splice(index, 1);
      await config.save();
      return NextResponse.json({ success: true, message: "Offer deleted" });
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
  } catch (err: any) {
    console.error("POST Admin Config Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
