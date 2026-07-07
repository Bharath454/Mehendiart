import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { GuestDesign } from "@/lib/models";
import { requireAdmin, authErrorResponse } from "@/lib/auth";

// GET /api/designs — Public
export async function GET() {
  try {
    await connectToDatabase();
    const designs = await GuestDesign.find();
    
    // Format _id to id
    const formattedDesigns = designs.map((d) => {
      const obj = d.toObject();
      obj.id = obj._id.toString();
      delete obj._id;
      delete obj.__v;
      return obj;
    });

    return NextResponse.json({ success: true, designs: formattedDesigns });
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
