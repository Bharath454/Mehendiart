import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { BridalPackage } from "@/lib/models";
import { requireAdmin, authErrorResponse } from "@/lib/auth";

const DEFAULT_PACKAGES = [
  {
    id: "package1",
    name: "Bridal Package 1",
    image: "/api/local-image?name=bridal1",
    description: "Both hands front and back till elbow",
    price: 3500,
    includes: [
      "Both hands front and back",
      "Elbow-length bridal coverage",
      "Traditional floral, paisley, and mandala detailing",
      "Customisation for the bride's style",
    ],
  },
  {
    id: "package2",
    name: "Bridal Package 2",
    image: "/api/local-image?name=bridal2",
    description: "Hands till elbow with simple leg mehendi",
    price: 4000,
    includes: [
      "Both hands front and back till elbow",
      "Simple leg design",
      "Balanced bridal detailing for elegant coverage",
      "Ideal for intimate ceremonies and receptions",
    ],
  },
  {
    id: "package3",
    name: "Bridal Package 3",
    image: "/api/local-image?name=bridal3",
    description: "Complete bridal hands and legs till ankle",
    price: 4500,
    includes: [
      "Both hands front and back till elbow",
      "Full legs till ankle",
      "Luxury bridal detailing for a grand wedding look",
      "Best choice for elaborate wedding ceremonies",
    ],
  },
];

// GET /api/packages — Public
export async function GET() {
  try {
    await connectToDatabase();
    let packages = await Promise.race([
      BridalPackage.find().lean(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB timeout")), 8000)
      ),
    ]) as any[];
    
    // Auto-seed default packages if collection is completely empty
    if (!packages || packages.length === 0) {
      try {
        const toInsert = DEFAULT_PACKAGES.map(({ id, ...rest }) => rest);
        const created = await BridalPackage.insertMany(toInsert);
        packages = created.map((p) => p.toObject());
      } catch (seedErr) {
        console.warn("Auto-seed packages fallback:", seedErr);
        packages = DEFAULT_PACKAGES;
      }
    }
    
    // Format _id to id
    const formattedPackages = (packages && packages.length > 0 ? packages : DEFAULT_PACKAGES).map((p: any) => {
      return {
        id: p._id ? p._id.toString() : (p.id || String(p._id)),
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
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err: any) {
    console.error("GET Packages Error:", err);
    return NextResponse.json(
      { success: true, packages: DEFAULT_PACKAGES },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
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
