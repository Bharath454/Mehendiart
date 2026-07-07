const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

// ─── 1. Parse .env.local ──────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("❌ Error: .env.local file not found at the project root!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    // Remove quotes if present
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const MONGODB_URI = env.MONGODB_URI;
const CLOUDINARY_CLOUD_NAME = env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = env.CLOUDINARY_API_SECRET;
const ADMIN_EMAIL = env.ADMIN_EMAIL || 'shahirabanu1706@gmail.com';
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'Shadi@Nail';

if (!MONGODB_URI || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("❌ Error: Missing MongoDB or Cloudinary credentials in .env.local!");
  console.log("Please make sure you have set MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  process.exit(1);
}

// Set env variables for Cloudinary
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

// ─── 2. Define Mongoose Schemas (simplified for script) ──────────────────────
const BridalPackageSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  includes: [String]
});
const BridalPackage = mongoose.models.BridalPackage || mongoose.model('BridalPackage', BridalPackageSchema);

const GuestDesignSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['Arabic', 'Indian'] },
  price: Number,
  image: String,
  description: String
});
const GuestDesign = mongoose.models.GuestDesign || mongoose.model('GuestDesign', GuestDesignSchema);

const ConfigSchema = new mongoose.Schema({
  blockedDates: [{ date: String, reason: String }],
  pricing: {
    bridal: { package1: Number, package2: Number, package3: Number },
    arabic: { palm: Number, wrist: Number, halfHand: Number, elbow: Number },
    indian: { palm: Number, wrist: Number, halfHand: Number, threeQuarterHand: Number, elbow: Number }
  },
  offers: [{ id: String, title: String, description: String, code: String, discountPercent: Number, active: Boolean }],
  adminPasswordHash: String
});
const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);

// ─── 3. Run Main Logic ────────────────────────────────────────────────────────
async function main() {
  console.log("🔄 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB.");

  const imagesDir = path.join(__dirname, '..', 'images');
  if (!fs.existsSync(imagesDir)) {
    console.error("❌ Error: 'images' directory not found. Please run this from the project root.");
    process.exit(1);
  }

  const files = fs.readdirSync(imagesDir).filter(file => file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.jpg'));
  const urlMap = {};

  console.log(`📸 Found ${files.length} images in images directory. Starting Cloudinary uploads...`);

  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    // Remove extension and space for clean matching (e.g., 'hero ' -> 'hero')
    const key = path.parse(file).name.trim().toLowerCase();
    
    console.log(`📤 Uploading ${file} to Cloudinary...`);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'mehendiart',
        format: 'webp'
      });
      urlMap[key] = result.secure_url;
      console.log(`   └─ Success: ${result.secure_url}`);
    } catch (err) {
      console.error(`   ❌ Failed to upload ${file}:`, err.message);
    }
  }

  // Helper to fallback if upload failed
  const getImg = (name) => urlMap[name] || `https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg`;

  console.log("\n🧹 Clearing existing Bridal Packages, Guest Designs, and Config...");
  await BridalPackage.deleteMany({});
  await GuestDesign.deleteMany({});
  await Config.deleteMany({});
  console.log("🧹 Collections cleared.");

  console.log("\n🌱 Seeding Bridal Packages...");
  const packages = [
    {
      name: "Bridal Package 1",
      image: getImg("bridal1"),
      description: "Both hands front and back till elbow",
      price: 3500,
      includes: [
        "Both hands front and back",
        "Elbow-length bridal coverage",
        "Traditional floral, paisley, and mandala detailing",
        "Customisation for the bride's style"
      ]
    },
    {
      name: "Bridal Package 2",
      image: getImg("bridal2"),
      description: "Hands till elbow with simple leg mehendi",
      price: 4000,
      includes: [
        "Both hands front and back till elbow",
        "Simple leg design",
        "Balanced bridal detailing for elegant coverage",
        "Ideal for intimate ceremonies and receptions"
      ]
    },
    {
      name: "Bridal Package 3",
      image: getImg("bridal3"),
      description: "Complete bridal hands and legs till ankle",
      price: 4500,
      includes: [
        "Both hands front and back till elbow",
        "Full legs till ankle",
        "Luxury bridal detailing for a grand wedding look",
        "Best choice for elaborate wedding ceremonies"
      ]
    }
  ];
  await BridalPackage.insertMany(packages);
  console.log("✅ Bridal Packages seeded.");

  console.log("\n🌱 Seeding Guest Designs...");
  const guestDesigns = [
    {
      name: "Arabic Palm Design",
      type: "Arabic",
      price: 50,
      image: getImg("arabic1"),
      description: "Elegant layout on the palm with custom motifs"
    },
    {
      name: "Arabic Wrist Design",
      type: "Arabic",
      price: 100,
      image: getImg("arabic2"),
      description: "Wrist length coverage featuring geometric details"
    },
    {
      name: "Arabic Half Hand",
      type: "Arabic",
      price: 150,
      image: getImg("arabic3"),
      description: "Half hand styling with modern paisley elements"
    },
    {
      name: "Arabic Elbow Length",
      type: "Arabic",
      price: 250,
      image: getImg("arabic4"),
      description: "Full elbow length contemporary design"
    },
    {
      name: "Indian Palm Design",
      type: "Indian",
      price: 100,
      image: getImg("indian1"),
      description: "Dense traditional patterns on the palm"
    },
    {
      name: "Indian Wrist Design",
      type: "Indian",
      price: 150,
      image: getImg("indian2"),
      description: "Detailed traditional patterns till the wrist"
    },
    {
      name: "Indian Half Hand",
      type: "Indian",
      price: 250,
      image: getImg("indian3"),
      description: "Dense floral detailing covering half the hand"
    },
    {
      name: "Indian 3/4 Hand",
      type: "Indian",
      price: 350,
      image: getImg("indian4"),
      description: "Elaborate motifs spanning 3/4 length of arm"
    },
    {
      name: "Indian Elbow Length",
      type: "Indian",
      price: 450,
      image: getImg("indian5"),
      description: "Complete traditional coverage till the elbow"
    }
  ];
  await GuestDesign.insertMany(guestDesigns);
  console.log("✅ Guest Designs seeded.");

  console.log("\n🌱 Seeding Config & Admin password hash...");
  
  // Bcrypt encryption for default password hash
  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, salt);

  await Config.create({
    blockedDates: [
      {
        date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
        reason: 'Personal Holiday / Family Function',
      }
    ],
    pricing: {
      bridal: { package1: 3500, package2: 4000, package3: 4500 },
      arabic: { palm: 50, wrist: 100, halfHand: 150, elbow: 250 },
      indian: { palm: 100, wrist: 150, halfHand: 250, threeQuarterHand: 350, elbow: 450 }
    },
    offers: [
      {
        id: 'off-1',
        title: 'Bridal Season Special',
        description: 'Get 10% off on Bridal Package 3',
        code: 'BRIDE10',
        discountPercent: 10,
        active: true
      }
    ],
    adminPasswordHash: hash
  });
  console.log("✅ Default Config and Admin Password seeded successfully.");

  console.log("\n🚀 All done! Cloudinary uploads complete and database fully seeded.");
  mongoose.connection.close();
}

main().catch(err => {
  console.error("❌ Seeding failed:", err);
  mongoose.connection.close();
});
