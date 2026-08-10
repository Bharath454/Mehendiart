import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { BridalPackage } from "@/lib/models";
import { requireAdmin, authErrorResponse } from "@/lib/auth";

// GET /api/packages — Public
export async function GET() {
  try {
    await connectToDatabase();
    const packages = await Promise.race([
      BridalPackage.find().lean(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB timeout")), 8000)
      ),
    ]) as any[];
    
    // Format _id to id
    const formattedPackages = packages.map((p: any) => {
      return {
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        includes: p.includes || [],
      };
    });

    return NextResponse.json(
      { success: true, packages: formattedPackages },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("GET Packages Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/packages — Admin only
export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const { name, description, price, image, includes } = await request.json();

    if (!name || !description || !price || !image) {
      return NextResponse.json(
        { error: "Name, description, price and image are required" },
        { status: 400 }
      );
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }

    await connectToDatabase();

    const newPkg = await BridalPackage.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: parsedPrice,
      image: String(image).trim(),
      includes: Array.isArray(includes) ? includes.filter(Boolean) : [],
    });

    const formattedPkg = newPkg.toObject();
    formattedPkg.id = formattedPkg._id.toString();

    return NextResponse.json({ success: true, package: formattedPkg });
  } catch (err: any) {
    console.error("POST Package Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/packages — Admin only
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const { id, name, description, price, image, includes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (name) updates.name = String(name).trim();
    if (description) updates.description = String(description).trim();
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
      }
      updates.price = parsedPrice;
    }
    if (image) updates.image = String(image).trim();
    if (includes && Array.isArray(includes)) updates.includes = includes.filter(Boolean);

    await connectToDatabase();

    const updated = await BridalPackage.findByIdAndUpdate(id, updates, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const formattedUpdated = updated.toObject();
    formattedUpdated.id = formattedUpdated._id.toString();

    return NextResponse.json({ success: true, package: formattedUpdated });
  } catch (err: any) {
    console.error("PATCH Package Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/packages?id=<id> — Admin only
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
      return NextResponse.json({ error: "Package ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const result = await BridalPackage.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (err: any) {
    console.error("DELETE Package Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
