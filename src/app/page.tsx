import React from "react";
import { getPricing } from "@/lib/db";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BridalPackages from "@/components/BridalPackages";
import GuestMehendi from "@/components/GuestMehendi";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

// Set dynamic page rendering so database edits are reflected instantly
export const dynamic = "force-dynamic";

export default function Home() {
  const pricing = getPricing();

  return (
    <>
      <Navbar />
      
      <main className="flex-grow">
        {/* 1. Hero Banner */}
        <Hero />

        {/* 2. Bridal Packages Pricing Grid */}
        <BridalPackages pricing={pricing} />

        {/* 3. Guest Party & Festival Henna pricing */}
        <GuestMehendi pricing={pricing} />

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
