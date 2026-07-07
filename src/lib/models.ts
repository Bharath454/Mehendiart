import mongoose, { Schema, Document } from 'mongoose';

// ─── Booking Model ────────────────────────────────────────────────────────────
export interface IBooking extends Document {
  id?: string;
  name: string;
  mobile: string;
  email: string;
  eventType: string;
  packageOrGuest: 'package' | 'guest';
  packageName?: string;
  designType?: string;
  subDesignName?: string;
  price: number;
  date: string;
  timeSlot: string;
  address: string;
  additionalNotes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  createdAt: Date;
}

const BookingSchema: Schema = new Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  eventType: { type: String, required: true },
  packageOrGuest: { type: String, required: true, enum: ['package', 'guest'] },
  packageName: { type: String },
  designType: { type: String },
  subDesignName: { type: String },
  price: { type: Number, required: true },
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  address: { type: String, required: true },
  additionalNotes: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

// ─── Bridal Package Model ─────────────────────────────────────────────────────
export interface IBridalPackage extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  includes: string[];
}

const BridalPackageSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  includes: [{ type: String }]
});

export const BridalPackage = mongoose.models.BridalPackage || mongoose.model<IBridalPackage>('BridalPackage', BridalPackageSchema);

// ─── Guest Design Model ───────────────────────────────────────────────────────
export interface IGuestDesign extends Document {
  name: string;
  type: 'Arabic' | 'Indian';
  price: number;
  image: string;
  description: string;
}

const GuestDesignSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Arabic', 'Indian'] },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String, default: '' }
});

export const GuestDesign = mongoose.models.GuestDesign || mongoose.model<IGuestDesign>('GuestDesign', GuestDesignSchema);

// ─── Inquiry Model ────────────────────────────────────────────────────────────
export interface IInquiry extends Document {
  name: string;
  email: string;
  mobile: string;
  message: string;
  createdAt: Date;
}

const InquirySchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Inquiry = mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);

// ─── User Model ───────────────────────────────────────────────────────────────
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ─── Config Model (Singleton for Pricing, Blocks, Offers, Admin) ──────────────
export interface IConfig extends Document {
  blockedDates: Array<{ date: string; reason: string }>;
  pricing: {
    bridal: { package1: number; package2: number; package3: number };
    arabic: { palm: number; wrist: number; halfHand: number; elbow: number };
    indian: { palm: number; wrist: number; halfHand: number; threeQuarterHand: number; elbow: number };
  };
  offers: Array<{
    id: string; // Keep manual ID for frontend compatibility
    title: string;
    description: string;
    code: string;
    discountPercent: number;
    active: boolean;
  }>;
  adminPasswordHash: string;
}

const ConfigSchema: Schema = new Schema({
  blockedDates: [{
    date: { type: String, required: true },
    reason: { type: String, required: true }
  }],
  pricing: {
    bridal: { package1: Number, package2: Number, package3: Number },
    arabic: { palm: Number, wrist: Number, halfHand: Number, elbow: Number },
    indian: { palm: Number, wrist: Number, halfHand: Number, threeQuarterHand: Number, elbow: Number }
  },
  offers: [{
    id: String,
    title: String,
    description: String,
    code: String,
    discountPercent: Number,
    active: Boolean
  }],
  adminPasswordHash: { type: String, default: '' } // Stores the admin bcrypt hash
});

export const Config = mongoose.models.Config || mongoose.model<IConfig>('Config', ConfigSchema);
