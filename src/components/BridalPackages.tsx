"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

export interface BridalPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  includes: string[];
}

interface BridalPackagesProps {
  packages: BridalPackage[];
}

export default function BridalPackages({ packages }: BridalPackagesProps) {

  return (
    <section id="bridal-packages" className="py-14 sm:py-20 bg-mehendi-bg relative overflow-hidden w-full">
      <div className="absolute inset-0 pattern-overlay opacity-20" />

      {/* Decorative Gold Dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mehendi-gold/45 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mehendi-gold/45 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-6 w-6 text-mehendi-gold" />
          </div>
          <span className="text-xs uppercase tracking-widest text-mehendi-gold font-bold">Premium Services</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-mehendi-darker tracking-wide mt-2 mb-4">
            Bridal Packages
          </h2>
          <p className="text-mehendi-darker/70 font-light text-sm sm:text-base leading-relaxed">
            Meticulously planned custom bridal designs. Each pack is customized and drawn with pure hand-mixed natural organic paste for a long-lasting, deep maroon stain.
          </p>
          <div className="w-24 h-0.5 bg-mehendi-gold mx-auto mt-6" />
        </div>

        {/* Pricing Cards Grid/Flex Container */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 lg:gap-8 w-full items-stretch">
          {packages.map((pkg, idx) => (
            <div
               key={pkg.id}
               className="bg-white rounded-2xl sm:rounded-3xl border border-mehendi-gold/20 shadow-lg hover:shadow-2xl hover:border-mehendi-gold/40 flex flex-col justify-between overflow-hidden relative transition-all duration-300 group lg:hover:-translate-y-2 w-full max-w-[350px] sm:max-w-sm sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-22px)]"
             >
              {/* Image Frame — portrait ratio, fits div, full hand visible */}
              <div className="relative w-full aspect-[4/5] overflow-hidden shrink-0">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Gold Gradient overlay at bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent z-10" />

                {/* Title & Description Overlayed */}
                <div className="absolute bottom-2.5 sm:bottom-4 left-3.5 sm:left-4 z-20 max-w-[85%] text-left">
                  <h3 className="font-serif font-bold text-sm sm:text-lg text-white tracking-wider leading-tight">
                    {pkg.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-mehendi-cream font-light mt-0.5">
                    {pkg.description}
                  </p>
                </div>
              </div>

              {/* Price strip directly below image */}
              <div className="px-4 sm:px-6 py-3.5 sm:py-5 flex items-end justify-between border-b border-mehendi-gold/10 bg-gradient-to-b from-white to-mehendi-bg/30">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-mehendi-olive/80 uppercase tracking-widest font-semibold block">Investment</span>
                  <div className="flex items-baseline">
                    <span className="text-xs sm:text-sm font-serif text-mehendi-olive font-bold mr-0.5">₹</span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-mehendi-dark">{pkg.price}</span>
                    <span className="text-[9px] sm:text-xs text-mehendi-olive/80 font-light ml-1">Onwards</span>
                  </div>
                </div>
                <div className="text-[9px] sm:text-[10px] font-bold text-mehendi-gold uppercase tracking-widest bg-mehendi-darker px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-mehendi-gold/30">
                  Popular
                </div>
              </div>

              {/* Package Details */}
              <div className="p-4 sm:p-6 lg:p-8 flex-grow flex flex-col justify-between">
                <p className="text-xs sm:text-sm text-mehendi-olive/80 mb-3 sm:mb-5 font-light leading-relaxed">
                  {pkg.description}
                </p>

                <ul className="space-y-2 sm:space-y-3.5 mb-5 sm:mb-8">
                  {(pkg.includes || []).map((inc, i) => (
                    <li key={i} className="flex items-start space-x-3 text-[11px] sm:text-xs text-mehendi-darker/90 font-light">
                      <div className="p-0.5 bg-mehendi-gold/15 rounded-full mt-0.5 shrink-0">
                        <Check className="h-3 w-3 text-mehendi-gold" />
                      </div>
                      <span className="leading-relaxed">{inc}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/booking?type=package&pkg=${pkg.id}`}
                  className="w-full inline-flex items-center justify-center bg-mehendi-dark hover:bg-mehendi-darker text-mehendi-cream text-xs uppercase font-bold tracking-widest py-3 sm:py-4 rounded-xl border border-mehendi-gold/25 shadow-md transition-all duration-300 hover:scale-[1.01]"
                >
                  <span>Book Package Now</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
