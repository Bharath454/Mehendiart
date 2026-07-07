"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface BridalPackagesProps {
  pricing: {
    package1: number;
    package2: number;
    package3: number;
  };
}

export default function BridalPackages({ pricing }: BridalPackagesProps) {
  const packages = [
    {
      id: "package1",
      name: "Bridal Package 1",
      image: "/api/local-image?name=bridal1",
      description: "Both hands front and back till elbow",
      price: pricing?.package1 || 3500,
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
      price: pricing?.package2 || 4000,
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
      price: pricing?.package3 || 4500,
      includes: [
        "Both hands front and back till elbow",
        "Full legs till ankle",
        "Luxury bridal detailing for a grand wedding look",
        "Best choice for elaborate wedding ceremonies",
      ],
    },
  ];

  return (
    <section id="bridal-packages" className="py-20 bg-mehendi-bg relative overflow-hidden">
      <div className="absolute inset-0 pattern-overlay opacity-20" />

      {/* Decorative Gold Dividers */}
      <div className="flex justify-center mb-4">
        <Sparkles className="h-6 w-6 text-mehendi-gold animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-mehendi-darker tracking-wide mb-4">
            Exclusive Bridal Packages
          </h2>
          <p className="text-mehendi-darker/70 font-light text-sm sm:text-base leading-relaxed">
            Choose from our curated wedding packages designed to make every bride shine on her special day. Handcrafted designs styled specifically for your vision.
          </p>
          <div className="w-24 h-0.5 bg-mehendi-gold mx-auto mt-6" />
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white rounded-3xl border border-mehendi-gold/20 shadow-lg hover:shadow-2xl hover:border-mehendi-gold/40 flex flex-col justify-between overflow-hidden relative transition-all duration-300 group hover:-translate-y-2"
            >
              {/* Image Frame */}
              <div className="relative h-64 overflow-hidden shrink-0">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Gold Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />

                {/* Title & Description Overlayed */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <h3 className="font-serif font-bold text-lg text-white tracking-wide">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-mehendi-cream font-light mt-0.5">
                    {pkg.description}
                  </p>
                </div>
              </div>

              {/* Price strip directly below image */}
              <div className="px-6 pt-5 flex items-end justify-between border-b border-mehendi-gold/10 pb-5 bg-gradient-to-b from-white to-mehendi-bg/30">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-mehendi-olive font-semibold mb-1">Starting from</p>
                  <div className="flex items-baseline">
                    <span className="text-sm font-medium text-mehendi-olive mr-1 font-serif">₹</span>
                    <span className="text-3xl font-serif font-bold text-mehendi-darker">{pkg.price}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-mehendi-olive/80 leading-relaxed max-w-[140px]">
                  Transportation charges extra
                </div>
              </div>

              {/* Package Details */}
              <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
                <p className="text-sm text-mehendi-olive/80 mb-5 font-light leading-relaxed">
                  {pkg.description}
                </p>

                {/* Details List */}
                <ul className="space-y-3.5 mb-8">
                  {pkg.includes.map((inc, i) => (
                    <li key={i} className="flex items-start space-x-3 text-sm text-mehendi-darker/80 font-light">
                      <Check className="h-4.5 w-4.5 text-mehendi-gold shrink-0 mt-0.5 bg-mehendi-gold/10 p-0.5 rounded-full" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>

                {/* Pricing & CTA Button */}
                <div className="pt-2 border-t border-mehendi-gold/10">
                  <Link
                    href={`/booking?type=package&pkg=${pkg.id}`}
                    className="w-full text-center block bg-gradient-to-r from-mehendi-dark to-mehendi-olive text-mehendi-cream hover:shadow-lg font-medium py-3 rounded-full border border-mehendi-gold/30 transition-all duration-300"
                  >
                    Book Now
                  </Link>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
