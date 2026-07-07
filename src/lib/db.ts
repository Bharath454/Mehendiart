import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Types
export interface Booking {
  id: string;
  name: string;
  mobile: string;
  email: string;
  eventType: string;
  packageOrGuest: 'package' | 'guest';
  packageName?: string;
  designType?: string;
  subDesignName?: string;
  price: number;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  address: string;
  additionalNotes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
}

export interface BlockedDate {
  date: string; // YYYY-MM-DD
  reason: string;
}

export interface PricingConfig {
  bridal: {
    package1: number;
    package2: number;
    package3: number;
  };
  arabic: {
    palm: number;
    wrist: number;
    halfHand: number;
    elbow: number;
  };
  indian: {
    palm: number;
    wrist: number;
    halfHand: number;
    threeQuarterHand: number;
    elbow: number;
  };
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercent: number;
  active: boolean;
}

export interface DBStructure {
  bookings: Booking[];
  blockedDates: BlockedDate[];
  pricing: PricingConfig;
  offers: Offer[];
  adminUsername: string;
  adminPasswordHash: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial state
const getDefaultDB = (): DBStructure => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  return {
    bookings: [
      {
        id: 'bk-1',
        name: 'Aishwarya R.',
        mobile: '9876543210',
        email: 'aishwarya@gmail.com',
        eventType: 'Wedding / Bridal',
        packageOrGuest: 'package',
        packageName: 'Bridal Package 3 (Full Hands & Legs till Ankle)',
        price: 4500,
        date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
        timeSlot: '10:00 AM - 02:00 PM',
        address: 'No:42/87, Angappan Naicke Street, George Town, Mannady, Chennai - 600001',
        additionalNotes: 'Please arrive on time. Looking forward to traditional designs.',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'bk-2',
        name: 'Divya Kumar',
        mobile: '9840123456',
        email: 'divya@yahoo.com',
        eventType: 'Baby Shower',
        packageOrGuest: 'guest',
        designType: 'Indian',
        subDesignName: 'Half Hand',
        price: 250,
        date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days from now
        timeSlot: '03:00 PM - 06:00 PM',
        address: 'Adyar, Chennai',
        additionalNotes: 'Need simple lotus motif design.',
        status: 'accepted',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 'bk-3',
        name: 'Pooja Sen',
        mobile: '9123456789',
        email: 'pooja@outlook.com',
        eventType: 'Festival',
        packageOrGuest: 'guest',
        designType: 'Arabic',
        subDesignName: 'Elbow',
        price: 250,
        date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
        timeSlot: '11:00 AM - 01:00 PM',
        address: 'Velachery, Chennai',
        status: 'completed',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      } as unknown as Booking, // Type casting completed status (mapped to "accepted" in system but for revenue history)
    ],
    blockedDates: [
      {
        date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], // 10 days from now
        reason: 'Personal Holiday / Family Function',
      },
    ],
    pricing: {
      bridal: {
        package1: 3500,
        package2: 4000,
        package3: 4500,
      },
      arabic: {
        palm: 50,
        wrist: 100,
        halfHand: 150,
        elbow: 250,
      },
      indian: {
        palm: 100,
        wrist: 150,
        halfHand: 250,
        threeQuarterHand: 350,
        elbow: 450,
      },
    },
    offers: [
      {
        id: 'off-1',
        title: 'Bridal Season Special',
        description: 'Get 10% off on Bridal Package 3',
        code: 'BRIDE10',
        discountPercent: 10,
        active: true,
      },
    ],
    adminUsername: 'admin',
    adminPasswordHash: adminPasswordHash,
  };
};

// Initialize DB file if not exists
const initDB = (): DBStructure => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultData = getDefaultDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as DBStructure;
  } catch (err) {
    console.error('Error reading JSON DB, resetting to default', err);
    const defaultData = getDefaultDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
};

// Get database instance
export const getDB = (): DBStructure => {
  return initDB();
};

// Save database
export const saveDB = (data: DBStructure): void => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// Helper methods to modify database tables easily
export const getBookings = (): Booking[] => {
  return getDB().bookings;
};

export const addBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking => {
  const db = getDB();
  const newBooking: Booking = {
    ...booking,
    id: `bk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.bookings.push(newBooking);
  saveDB(db);
  return newBooking;
};

export const updateBookingStatus = (id: string, status: Booking['status']): Booking | null => {
  const db = getDB();
  const index = db.bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;
  db.bookings[index].status = status;
  saveDB(db);
  return db.bookings[index];
};

export const getBlockedDates = (): BlockedDate[] => {
  return getDB().blockedDates;
};

export const toggleBlockedDate = (date: string, reason: string): BlockedDate[] => {
  const db = getDB();
  const index = db.blockedDates.findIndex((b) => b.date === date);
  if (index !== -1) {
    db.blockedDates.splice(index, 1); // remove if exists (unblock)
  } else {
    db.blockedDates.push({ date, reason }); // add if new (block)
  }
  saveDB(db);
  return db.blockedDates;
};

export const getPricing = (): PricingConfig => {
  return getDB().pricing;
};

export const updatePricing = (newPricing: PricingConfig): PricingConfig => {
  const db = getDB();
  db.pricing = newPricing;
  saveDB(db);
  return db.pricing;
};

export const getOffers = (): Offer[] => {
  return getDB().offers;
};

export const addOffer = (offer: Omit<Offer, 'id'>): Offer => {
  const db = getDB();
  const newOffer = {
    ...offer,
    id: `off-${Date.now()}`,
  };
  db.offers.push(newOffer);
  saveDB(db);
  return newOffer;
};

export const toggleOffer = (id: string): Offer | null => {
  const db = getDB();
  const index = db.offers.findIndex((o) => o.id === id);
  if (index === -1) return null;
  db.offers[index].active = !db.offers[index].active;
  saveDB(db);
  return db.offers[index];
};
