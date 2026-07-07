import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IMAGE_MAP: Record<string, string> = {
  hero: "hero .jpeg",
  bridal1: "bridal1.jpeg",
  bridal2: "bridal2.jpeg",
  bridal3: "bridal3.jpeg",
  arabic1: "arabic1.jpeg",
  arabic2: "arabic2.jpeg",
  arabic3: "arabic3.jpeg",
  arabic4: "arabic4.jpeg",
  indian1: "indian1.jpeg",
  indian2: "indian2.jpeg",
  indian3: "indian3.jpeg",
  indian4: "indian4.jpeg",
  indian5: "indian5.jpeg",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") || "";
  const fileName = IMAGE_MAP[name];

  if (!fileName) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), fileName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Image file missing" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const contentType = fileName.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}