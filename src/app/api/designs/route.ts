import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { GuestDesign } from "@/lib/models";
import { requireAdmin, authErrorResponse } from "@/lib/auth";

const DEFAULT_DESIGNS = [
  { name: "Arabic Palm Design", type: "Arabic", price: 50, image: "/api/local-image?name=arabic1", description: "Clean spaced floral motifs" },
  { name: "Arabic Wrist Design", type: "Arabic", price: 100, image: "/api/local-image?name=arabic2", description: "Intricate cuff with delicate trailing vines" },
  { name: "Arabic Half Hand", type: "Arabic", price: 150, image: "/api/local-image?name=arabic3", description: "Flowing paisley and leaf pattern to mid-forearm" },
  { name: "Arabic Elbow Length", type: "Arabic", price: 250, image: "/api/local-image?name=arabic4", description: "Full forearm coverage with dramatic negative space" },
  { name: "Indian Palm Design", type: "Indian", price: 100, image: "/api/local-image?name=indian1", description: "Traditional round mandala with detailed finger caps" },
  { name: "Indian Wrist Design", type: "Indian", price: 150, image: "/api/local-image?name=indian2", description: "Dense peacock and floral wrist band" },
  { name: "Indian Half Hand", type: "Indian", price: 250, image: "/api/local-image?name=indian3", description: "Classic Rajasthani netting and jaal pattern" },
  { name: "Indian 3/4 Hand", type: "Indian", price: 350, image: "/api/local-image?name=indian4", description: "Elaborate multi-tier bridal-style guest work" },
  { name: "Indian Elbow Length", type: "Indian", price: 450, image: "/api/local-image?name=indian5", description: "Full elbow coverage with rich traditional motifs" },
];

// GET /api/designs — Public
export async function GET() {
  try {
    await connectToDatabase();
    let designs = await Promise.race([
      GuestDesign.find().lean(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB timeout")), 8000)
      ),
    ]) as any[];
    
    // Auto-seed default designs if collection is completely empty
    if (!designs || designs.length === 0) {
      try {
        const created = await GuestDesign.insertMany(DEFAULT_DESIGNS);
        designs = created.map((d) => d.toObject());
      } catch (seedErr) {
        console.warn("Auto-seed designs fallback:", seedErr);
      }
    }
    
    // Format _id to id
    const formattedDesigns = (designs || []).map((d: any) => {
      return {
        id: d._id?.toString() || d.id,
        name: d.name,
        type: d.type,
        price: d.price,
        image: d.image,
        description: d.description || "",
      };
    });

    return NextResponse.json(
      { success: true, designs: formattedDesigns },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("GET Designs Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/designs — Admin only
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const { name, type, price, image, description } = await request.json();

    if (!name || !type || !price || !image) {
      return NextResponse.json(
        { error: "Name, type, price and image are required" },
        { status: 400 }
      );
    }

    if (type !== "Arabic" && type !== "Indian") {
      return NextResponse.json(
        { error: "Type must be 'Arabic' or 'Indian'" },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    await connectToDatabase();

    const newDesign = await GuestDesign.create({
      name: String(name).trim(),
      type,
      price: parsedPrice,
      image: String(image).trim(),
      description: description ? String(description).trim() : "",
    });

    const formattedDesign = newDesign.toObject();
    formattedDesign.id = formattedDesign._id.toString();

    return NextResponse.json({ success: true, design: formattedDesign });
  } catch (err: any) {
    console.error("POST Design Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/designs — Admin only
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const { id, name, type, price, image, description } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Design ID is required" }, { status: 400 });
    }

    if (type && type !== "Arabic" && type !== "Indian") {
      return NextResponse.json(
        { error: "Type must be 'Arabic' or 'Indian'" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};
    if (name) updates.name = String(name).trim();
    if (type) updates.type = type as "Arabic" | "Indian";
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
      }
      updates.price = parsedPrice;
    }
    if (image) updates.image = String(image).trim();
    if (description !== undefined) updates.description = String(description).trim();

    await connectToDatabase();

    const updated = await GuestDesign.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const formattedUpdated = updated.toObject();
    formattedUpdated.id = formattedUpdated._id.toString();

    return NextResponse.json({ success: true, design: formattedUpdated });
  } catch (err: any) {
    console.error("PATCH Design Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/designs?id=<id> — Admin only
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Design ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const result = await GuestDesign.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Design deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Design Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
