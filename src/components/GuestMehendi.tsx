"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag } from "lucide-react";

export interface GuestDesign {
  id: string;
  name: string;
  type: "Arabic" | "Indian";
  price: number;
  image: string;
  description?: string;
}

interface GuestMehendiProps {
  designs: GuestDesign[];
}

export default function GuestMehendi({ designs }: GuestMehendiProps) {
  const arabicDesigns = designs.filter((d) => d.type === "Arabic");
  const indianDesigns = designs.filter((d) => d.type === "Indian");

  return (
    <section id="guest-mehendi" className="py-14 sm:py-20 bg-white relative overflow-hidden w-full">
      <div className="absolute inset-0 pattern-overlay opacity-15" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-mehendi-gold font-bold">Party & Guests</span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-mehendi-darker tracking-wide mt-2 mb-4">
            Guest Mehendi Pricing
          </h2>
          <p className="text-mehendi-darker/70 font-light text-sm sm:text-base leading-relaxed">
            Meticulously planned custom bridal designs. Each pack is customized and drawn with pure hand-mixed natural organic paste for a long-lasting, deep maroon stain.
          </p>
          <div className="w-24 h-0.5 bg-mehendi-gold mx-auto mt-6" />
        </div>

        {/* 1. Arabic Designs Section */}
        <div className="mb-20">
          <div className="flex items-center space-x-3 mb-8 border-b border-mehendi-gold/25 pb-3">
            <Sparkles className="h-5 w-5 text-mehendi-gold" />
            <h3 className="font-serif text-2xl font-bold text-mehendi-dark tracking-wide">
              Arabic Henna Designs
            </h3>
            <span className="text-xs text-mehendi-olive/80 font-light ml-auto">Contemporary & Spaced Motifs</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {arabicDesigns.map((design, idx) => (
              <div
                key={`arabic-${design.id}`}
                className="bg-mehendi-bg/30 rounded-2xl border border-mehendi-gold/10 hover:border-mehendi-gold/30 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col justify-between"
              >
                {/* Image fills the container fully with a hover zoom effect */}
                <div className="relative w-full aspect-[3/4] overflow-hidden shrink-0 bg-stone-50">
                  <img
                    src={design.image}
                    alt={design.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-all pointer-events-none" />
                </div>
                
                <div className="p-5 flex-grow flex flex-col justify-between bg-gradient-to-b from-white/95 to-white/70">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-serif font-semibold text-mehendi-darker text-base">
                      {design.name}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-mehendi-gold/10">
                    <div className="flex items-baseline">
                      <span className="text-xs text-mehendi-olive font-serif mr-0.5">₹</span>
                      <span className="text-xl font-serif font-bold text-mehendi-dark">{design.price}</span>
                      <span className="text-[10px] text-mehendi-olive/80 font-light ml-1">/ hand</span>
                    </div>

                    <Link
                      href={`/booking?type=guest&design=arabic&sub=${design.id}`}
                      className="h-11 w-11 flex items-center justify-center rounded-full bg-mehendi-dark/5 hover:bg-mehendi-dark text-mehendi-dark hover:text-white transition-all duration-300 border border-mehendi-dark/20 hover:border-mehendi-dark active:scale-95 shrink-0"
                      aria-label="Book this design"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Indian Designs Section */}
        <div>
          <div className="flex items-center space-x-3 mb-8 border-b border-mehendi-gold/25 pb-3">
            <Sparkles className="h-5 w-5 text-mehendi-gold" />
            <h3 className="font-serif text-2xl font-bold text-mehendi-dark tracking-wide">
              Traditional Indian Designs
            </h3>
            <span className="text-xs text-mehendi-olive/80 font-light ml-auto">Dense & Detailed Patterns</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {indianDesigns.map((design, idx) => (
              <div
                key={`indian-${design.id}`}
                className="bg-mehendi-bg/30 rounded-2xl border border-mehendi-gold/10 hover:border-mehendi-gold/30 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col justify-between"
              >
                {/* Image fills the container fully with a hover zoom effect */}
                <div className="relative w-full aspect-[3/4] overflow-hidden shrink-0 bg-stone-50">
                  <img
                    src={design.image}
                    alt={design.name}
                    className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-all pointer-events-none" />
                </div>
                
                <div className="p-4.5 flex-grow flex flex-col justify-between bg-gradient-to-b from-white/95 to-white/70">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-serif font-semibold text-mehendi-darker text-sm sm:text-base">
                      {design.name}
                    </h4>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-mehendi-gold/10">
                    <div className="flex items-baseline">
                      <span className="text-xs text-mehendi-olive font-serif mr-0.5">₹</span>
                      <span className="text-lg font-serif font-bold text-mehendi-dark">{design.price}</span>
                      <span className="text-[9px] text-mehendi-olive/80 font-light ml-1">/ hand</span>
                    </div>

                    <Link
                      href={`/booking?type=guest&design=indian&sub=${design.id}`}
                      className="h-11 w-11 flex items-center justify-center rounded-full bg-mehendi-dark/5 hover:bg-mehendi-dark text-mehendi-dark hover:text-white transition-all duration-300 border border-mehendi-dark/20 hover:border-mehendi-dark active:scale-95 shrink-0"
                      aria-label="Book this design"
                    >
                      <ShoppingBag className="h-4.5 w-4.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
