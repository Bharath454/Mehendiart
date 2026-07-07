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

export interface BridalPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  includes: string[];
}

export interface GuestDesign {
  id: string;
  name: string;
  type: 'Arabic' | 'Indian';
  price: number;
  image: string;
  description?: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface DBStructure {
  bookings: Booking[];
  blockedDates: BlockedDate[];
  pricing: PricingConfig;
  offers: Offer[];
  adminEmail: string;
  adminUsername: string;
  adminPasswordHash: string;
  users?: User[];
  inquiries?: Inquiry[];
  bridalPackages?: BridalPackage[];
  guestDesigns?: GuestDesign[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial state
const getDefaultDB = (): DBStructure => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Shadi@Nail', salt);

  return {
    bookings: [
      {
        id: 'bk-1',
        name: 'Aishwarya R.',
        mobile: '9876543210',
        email: 'aishwarya@gmail.com',
        eventType: 'Wedding / Bridal',
        packageOrGuest: 'package',
        packageName: 'Bridal Package 3',
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
    adminEmail: process.env.ADMIN_EMAIL || 'shahirabanu1706@gmail.com',
    adminUsername: 'admin',
    adminPasswordHash: adminPasswordHash,
    users: [],
    inquiries: [],
    bridalPackages: [
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
          "Customisation for the bride's style"
        ]
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
          "Ideal for intimate ceremonies and receptions"
        ]
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
          "Best choice for elaborate wedding ceremonies"
        ]
      }
    ],
    guestDesigns: [
      {
        id: "arabic-palm",
        name: "Arabic Palm Design",
        type: "Arabic",
        price: 50,
        image: "/api/local-image?name=arabic1",
        description: "Elegant layout on the palm with custom motifs"
      },
      {
        id: "arabic-wrist",
        name: "Arabic Wrist Design",
        type: "Arabic",
        price: 100,
        image: "/api/local-image?name=arabic2",
        description: "Wrist length coverage featuring geometric details"
      },
      {
        id: "arabic-half",
        name: "Arabic Half Hand",
        type: "Arabic",
        price: 150,
        image: "/api/local-image?name=arabic3",
        description: "Half hand styling with modern paisley elements"
      },
      {
        id: "arabic-elbow",
        name: "Arabic Elbow Length",
        type: "Arabic",
        price: 250,
        image: "/api/local-image?name=arabic4",
        description: "Full elbow length contemporary design"
      },
      {
        id: "indian-palm",
        name: "Indian Palm Design",
        type: "Indian",
        price: 100,
        image: "/api/local-image?name=indian1",
        description: "Dense traditional patterns on the palm"
      },
      {
        id: "indian-wrist",
        name: "Indian Wrist Design",
        type: "Indian",
        price: 150,
        image: "/api/local-image?name=indian2",
        description: "Detailed traditional patterns till the wrist"
      },
      {
        id: "indian-half",
        name: "Indian Half Hand",
        type: "Indian",
        price: 250,
        image: "/api/local-image?name=indian3",
        description: "Dense floral detailing covering half the hand"
      },
      {
        id: "indian-threequarter",
        name: "Indian 3/4 Hand",
        type: "Indian",
        price: 350,
        image: "/api/local-image?name=indian4",
        description: "Elaborate motifs spanning 3/4 length of arm"
      },
      {
        id: "indian-elbow",
        name: "Indian Elbow Length",
        type: "Indian",
        price: 450,
        image: "/api/local-image?name=indian5",
        description: "Complete traditional coverage till the elbow"
      }
    ]
  };
};

// Initialize DB file if not exists and perform migrations dynamically
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
    const data = JSON.parse(raw) as DBStructure;
    
    // Migration checks to make sure new fields always exist
    let updated = false;
    if (!data.users) {
      data.users = [];
      updated = true;
    }
    if (!data.inquiries) {
      data.inquiries = [];
      updated = true;
    }
    if (!data.bridalPackages || data.bridalPackages.length === 0) {
      data.bridalPackages = getDefaultDB().bridalPackages;
      updated = true;
    }
    if (!data.guestDesigns || data.guestDesigns.length === 0) {
      data.guestDesigns = getDefaultDB().guestDesigns;
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }

    return data;
  } catch (err) {
    console.error('Error reading/migrating JSON DB, resetting to default', err);
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

// ─── Booking Helpers ────────────────────────────────────────────────────────
export const getBookings = (): Booking[] => {
  return getDB().bookings;
};

export const addBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Booking => {
  const db = getDB();
  const newBooking: Booking = {
    ...booking,
    id: `bk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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

// ─── Blocked Dates Helpers ──────────────────────────────────────────────────
export const getBlockedDates = (): BlockedDate[] => {
  return getDB().blockedDates;
};

export const toggleBlockedDate = (date: string, reason: string): BlockedDate[] => {
  const db = getDB();
  const index = db.blockedDates.findIndex((b) => b.date === date);
  if (index !== -1) {
    db.blockedDates.splice(index, 1);
  } else {
    db.blockedDates.push({ date, reason });
  }
  saveDB(db);
  return db.blockedDates;
};

// ─── Pricing Helpers ────────────────────────────────────────────────────────
export const getPricing = (): PricingConfig => {
  return getDB().pricing;
};

export const updatePricing = (newPricing: PricingConfig): PricingConfig => {
  const db = getDB();
  db.pricing = newPricing;
  saveDB(db);
  return db.pricing;
};

// ─── Offers Helpers ─────────────────────────────────────────────────────────
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

// ─── Users Helpers ──────────────────────────────────────────────────────────
export const getUsers = (): User[] => {
  return getDB().users || [];
};

export const addUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const db = getDB();
  if (!db.users) db.users = [];
  const newUser: User = {
    ...user,
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  saveDB(db);
  return newUser;
};

// ─── Inquiries Helpers ───────────────────────────────────────────────────────
export const getInquiries = (): Inquiry[] => {
  return getDB().inquiries || [];
};

export const addInquiry = (inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Inquiry => {
  const db = getDB();
  if (!db.inquiries) db.inquiries = [];
  const newInquiry: Inquiry = {
    ...inquiry,
    id: `inq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString()
  };
  db.inquiries.push(newInquiry);
  saveDB(db);
  return newInquiry;
};

// ─── Bridal Packages CRUD ───────────────────────────────────────────────────
export const getBridalPackages = (): BridalPackage[] => {
  return getDB().bridalPackages || [];
};

export const addBridalPackage = (pkg: Omit<BridalPackage, 'id'>): BridalPackage => {
  const db = getDB();
  if (!db.bridalPackages) db.bridalPackages = [];
  const newPkg: BridalPackage = {
    ...pkg,
    id: `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  };
  db.bridalPackages.push(newPkg);
  saveDB(db);
  return newPkg;
};

export const updateBridalPackage = (id: string, updatedPkg: Partial<Omit<BridalPackage, 'id'>>): BridalPackage | null => {
  const db = getDB();
  if (!db.bridalPackages) db.bridalPackages = [];
  const index = db.bridalPackages.findIndex(p => p.id === id);
  if (index === -1) return null;
  db.bridalPackages[index] = { ...db.bridalPackages[index], ...updatedPkg };
  saveDB(db);
  return db.bridalPackages[index];
};

export const deleteBridalPackage = (id: string): boolean => {
  const db = getDB();
  if (!db.bridalPackages) return false;
  const index = db.bridalPackages.findIndex(p => p.id === id);
  if (index === -1) return false;
  db.bridalPackages.splice(index, 1);
  saveDB(db);
  return true;
};

// ─── Guest Designs CRUD ─────────────────────────────────────────────────────
export const getGuestDesigns = (): GuestDesign[] => {
  return getDB().guestDesigns || [];
};

export const addGuestDesign = (design: Omit<GuestDesign, 'id'>): GuestDesign => {
  const db = getDB();
  if (!db.guestDesigns) db.guestDesigns = [];
  const newDesign: GuestDesign = {
    ...design,
    id: `des-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  };
  db.guestDesigns.push(newDesign);
  saveDB(db);
  return newDesign;
};

export const updateGuestDesign = (id: string, updatedDesign: Partial<Omit<GuestDesign, 'id'>>): GuestDesign | null => {
  const db = getDB();
  if (!db.guestDesigns) db.guestDesigns = [];
  const index = db.guestDesigns.findIndex(d => d.id === id);
  if (index === -1) return null;
  db.guestDesigns[index] = { ...db.guestDesigns[index], ...updatedDesign };
  saveDB(db);
  return db.guestDesigns[index];
};

export const deleteGuestDesign = (id: string): boolean => {
  const db = getDB();
  if (!db.guestDesigns) return false;
  const index = db.guestDesigns.findIndex(d => d.id === id);
  if (index === -1) return false;
  db.guestDesigns.splice(index, 1);
  saveDB(db);
  return true;
};
