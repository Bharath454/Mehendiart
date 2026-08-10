import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BridalPackages, { BridalPackage } from "@/components/BridalPackages";
import GuestMehendi, { GuestDesign } from "@/components/GuestMehendi";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import connectToDatabase from "@/lib/mongoose";
import { BridalPackage as BridalPackageModel, GuestDesign as GuestDesignModel } from "@/lib/models";

// Revalidate every 60 seconds — changes from admin reflect quickly
export const revalidate = 60;

// Default data shown instantly if DB is slow / unreachable
const DEFAULT_PACKAGES: BridalPackage[] = [
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

const DEFAULT_DESIGNS: GuestDesign[] = [
  { id: "arabic-palm", name: "Arabic Palm Design", type: "Arabic", price: 50, image: "/api/local-image?name=arabic1" },
  { id: "arabic-wrist", name: "Arabic Wrist Design", type: "Arabic", price: 100, image: "/api/local-image?name=arabic2" },
  { id: "arabic-half", name: "Arabic Half Hand", type: "Arabic", price: 150, image: "/api/local-image?name=arabic3" },
  { id: "arabic-elbow", name: "Arabic Elbow Length", type: "Arabic", price: 250, image: "/api/local-image?name=arabic4" },
  { id: "indian-palm", name: "Indian Palm Design", type: "Indian", price: 100, image: "/api/local-image?name=indian1" },
  { id: "indian-wrist", name: "Indian Wrist Design", type: "Indian", price: 150, image: "/api/local-image?name=indian2" },
  { id: "indian-half", name: "Indian Half Hand", type: "Indian", price: 250, image: "/api/local-image?name=indian3" },
  { id: "indian-threequarter", name: "Indian 3/4 Hand", type: "Indian", price: 350, image: "/api/local-image?name=indian4" },
  { id: "indian-elbow", name: "Indian Elbow Length", type: "Indian", price: 450, image: "/api/local-image?name=indian5" },
];

async function fetchHomeData(): Promise<{
  packages: BridalPackage[];
  designs: GuestDesign[];
}> {
  try {
    await connectToDatabase();

    const [rawPackages, rawDesigns] = await Promise.all([
      BridalPackageModel.find().lean(),
      GuestDesignModel.find().lean(),
    ]);

    const packages: BridalPackage[] =
      rawPackages.length > 0
        ? rawPackages.map((p: any) => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            price: p.price,
            image: p.image,
            includes: p.includes || [],
          }))
        : DEFAULT_PACKAGES;

    const designs: GuestDesign[] =
      rawDesigns.length > 0
        ? rawDesigns.map((d: any) => ({
            id: d._id.toString(),
            name: d.name,
            type: d.type,
            price: d.price,
            image: d.image,
            description: d.description || "",
          }))
        : DEFAULT_DESIGNS;

    return { packages, designs };
  } catch (err) {
    console.error("Home page DB fetch failed, using defaults:", err);
    return { packages: DEFAULT_PACKAGES, designs: DEFAULT_DESIGNS };
  }
}

export default async function Home() {
  const { packages, designs } = await fetchHomeData();

  return (
    <>
      <Navbar />
      
      <main className="flex-grow">
        {/* 1. Hero Banner */}
        <Hero />

        {/* 2. Bridal Packages Pricing Grid */}
        <BridalPackages packages={packages} />

        {/* 3. Guest Party & Festival Henna pricing */}
        <GuestMehendi designs={designs} />

        {/* 4. Categorized Image Gallery & Lightbox */}
        <Gallery />

        {/* 5. Client Testimonials Reviews Slider */}
        <Testimonials />

        {/* 6. Contact coordinates and Map */}
        <Contact />
      </main>

      {/* Footer Branding Links */}
      <Footer />
    </>
  );
}
