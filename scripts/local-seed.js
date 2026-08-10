const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// ─── Load Environment Variables ──────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("❌ Error: .env.local file not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const MONGODB_URI = env.MONGODB_URI || "mongodb://127.0.0.1:27017/mehendi";
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || 'your-admin-password';

// ─── Define Schema ────────────────────────────────────────────────────────────
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

const BookingSchema = new mongoose.Schema({
  name: String,
  mobile: String,
  email: String,
  eventType: String,
  packageOrGuest: String,
  packageName: String,
  designType: String,
  subDesignName: String,
  price: Number,
  date: String,
  timeSlot: String,
  address: String,
  additionalNotes: String,
  status: String,
  createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

// ─── Run Seed ────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔄 Connecting to local MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB.");

  // Load db.json
  const dbJsonPath = path.join(__dirname, '..', 'data', 'db.json');
  if (!fs.existsSync(dbJsonPath)) {
    console.error("❌ Error: data/db.json not found!");
    process.exit(1);
  }
  
  const dbData = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

  console.log("\n🧹 Clearing existing collections...");
  await BridalPackage.deleteMany({});
  await GuestDesign.deleteMany({});
  await Config.deleteMany({});
  await Booking.deleteMany({});
  console.log("🧹 Collections cleared.");

  console.log("\n🌱 Seeding Bridal Packages...");
  await BridalPackage.insertMany(dbData.bridalPackages);
  console.log(`✅ Seeded ${dbData.bridalPackages.length} Bridal Packages.`);

  console.log("\n🌱 Seeding Guest Designs...");
  await GuestDesign.insertMany(dbData.guestDesigns);
  console.log(`✅ Seeded ${dbData.guestDesigns.length} Guest Designs.`);

  console.log("\n🌱 Seeding Bookings...");
  if (dbData.bookings && dbData.bookings.length > 0) {
    await Booking.insertMany(dbData.bookings);
    console.log(`✅ Seeded ${dbData.bookings.length} Bookings.`);
  }

  console.log("\n🌱 Seeding Config & Admin password hash...");
  const bcrypt = require('bcryptjs');
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(ADMIN_PASSWORD, salt);

  await Config.create({
    blockedDates: dbData.blockedDates || [],
    pricing: dbData.pricing,
    offers: dbData.offers,
    adminPasswordHash: hash
  });
  console.log("✅ Config and Admin password hash seeded.");

  console.log("\n🚀 Seeding completed successfully!");
  mongoose.connection.close();
}

main().catch(err => {
  console.error("❌ Seeding failed:", err);
  mongoose.connection.close();
});
