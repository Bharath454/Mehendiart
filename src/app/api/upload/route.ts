import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

const isCloudinaryConfigured =
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "your-cloud-name" &&
  process.env.CLOUDINARY_CLOUD_NAME.trim() !== "" &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== "your-api-key" &&
  process.env.CLOUDINARY_API_KEY.trim() !== "" &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== "your-api-secret" &&
  process.env.CLOUDINARY_API_SECRET.trim() !== "");

// Configure Cloudinary only if valid credentials are provided
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Allowed MIME types and extensions for uploaded images
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Maximum file size: 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  // Admin-only endpoint
  try {
    await requireAdmin();
  } catch (err) {
    return authErrorResponse(err);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ─── File Type Validation ──────────────────────────────────────────────

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed." },
        { status: 400 }
      );
    }

    // ─── File Size Validation ──────────────────────────────────────────────

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum allowed size is 5 MB." },
        { status: 400 }
      );
    }

    // ─── Read & Upload to Cloudinary ────────────────────────────────────────

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file signature (magic bytes) for images
    if (!isValidImageBuffer(buffer, file.type)) {
      return NextResponse.json(
        { error: "File content does not match its declared type." },
        { status: 400 }
      );
    }

    let imageUrl = "";

    if (isCloudinaryConfigured) {
      try {
        // Upload using Cloudinary upload_stream
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "mehendiart", // Store in a specific folder on Cloudinary
              format: "webp",       // Convert everything to webp for performance
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          
          uploadStream.end(buffer);
        });
        imageUrl = uploadResult.secure_url;
      } catch (cloudinaryError) {
        console.warn("Cloudinary upload failed, falling back to local storage:", cloudinaryError);
        imageUrl = await saveFileLocally(buffer, file.name, file.type);
      }
    } else {
      console.log("Cloudinary is not configured. Saving file to local storage instead.");
      imageUrl = await saveFileLocally(buffer, file.name, file.type);
    }

    return NextResponse.json({
      success: true,
      url: imageUrl, // Return the uploaded image URL (Cloudinary or local /uploads/...)
      message: "File uploaded successfully",
    });
  } catch (err: any) {
    console.error("Upload API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Helper to save uploaded files locally to the public/uploads directory.
 */
async function saveFileLocally(buffer: Buffer, originalFilename: string, mimeType: string): Promise<string> {
  let uploadsDir = path.join(process.cwd(), "public", "uploads");
  
  // If running from the workspace root, adjust the path to point inside the mehendiart folder
  const workspaceRootPublic = path.join(process.cwd(), "mehendiart", "public");
  try {
    const stat = await fs.stat(workspaceRootPublic);
    if (stat.isDirectory()) {
      uploadsDir = path.join(process.cwd(), "mehendiart", "public", "uploads");
    }
  } catch (err) {}

  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = originalFilename.split(".").pop() || mimeType.split("/")[1] || "png";
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const baseName = originalFilename.substring(0, originalFilename.lastIndexOf('.')) || originalFilename;
  const cleanBase = baseName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  const filename = `${cleanBase}-${uniqueSuffix}.${ext}`;

  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/${filename}`;
}

/**
 * Validates file magic bytes to prevent MIME type spoofing.
 */
function isValidImageBuffer(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: starts with FF D8 FF
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // WebP: starts with RIFF....WEBP
  if (mimeType === "image/webp") {
    return (
      buffer[0] === 0x52 && // R
      buffer[1] === 0x49 && // I
      buffer[2] === 0x46 && // F
      buffer[3] === 0x46    // F
    );
  }

  // GIF: starts with GIF87a or GIF89a
  if (mimeType === "image/gif") {
    return (
      buffer[0] === 0x47 && // G
      buffer[1] === 0x49 && // I
      buffer[2] === 0x46    // F
    );
  }

  return true; 
}
