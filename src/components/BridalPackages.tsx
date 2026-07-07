"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export interface BridalPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  includes: string[];
}

export default function BridalPackages() {
  const [packages, setPackages] = useState<BridalPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultPackages: BridalPackage[] = [
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

  useEffect(() => {
    async function loadPackages() {
      try {
        const response = await fetch("/api/packages");
        if (response.ok) {
          const data = await response.json();
          if (data.packages && data.packages.length > 0) {
            setPackages(data.packages);
          } else {
            setPackages(defaultPackages);
          }
        } else {
          setPackages(defaultPackages);
        }
      } catch (err) {
        console.error("Error loading bridal packages:", err);
        setPackages(defaultPackages);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center bg-mehendi-bg">
        <Loader2 className="h-10 w-10 text-mehendi-gold animate-spin" />
      </div>
    );
  }

  return (
    <section id="bridal-packages" className="py-14 sm:py-20 bg-mehendi-bg relative overflow-hidden w-full">
      <div className="absolute inset-0 pattern-overlay opacity-20" />

      {/* Decorative Gold Dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mehendi-gold/45 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-mehendi-gold/45 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
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

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {packages.map((pkg, idx) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white rounded-3xl border border-mehendi-gold/20 shadow-lg hover:shadow-2xl hover:border-mehendi-gold/40 flex flex-col justify-between overflow-hidden relative transition-all duration-300 group hover:-translate-y-2"
            >
              {/* Image Frame — portrait ratio, fills div, full hand visible */}
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
                  <span className="text-[10px] text-mehendi-olive/80 uppercase tracking-widest font-semibold block">Investment</span>
                  <div className="flex items-baseline">
                    <span className="text-sm font-serif text-mehendi-olive font-bold mr-0.5">₹</span>
                    <span className="text-2xl sm:text-3xl font-serif font-bold text-mehendi-dark">{pkg.price}</span>
                    <span className="text-xs text-mehendi-olive/80 font-light ml-1.5">Onwards</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-mehendi-gold uppercase tracking-widest bg-mehendi-darker px-3 py-1.5 rounded-lg border border-mehendi-gold/30">
                  Popular
                </div>
              </div>

              {/* Package Details */}
              <div className="p-4 sm:p-6 lg:p-8 flex-grow flex flex-col justify-between">
                <p className="text-sm text-mehendi-olive/80 mb-5 font-light leading-relaxed">
                  {pkg.description}
                </p>

                <ul className="space-y-3.5 mb-8">
                  {(pkg.includes || []).map((inc, i) => (
                    <li key={i} className="flex items-start space-x-3 text-xs text-mehendi-darker/90 font-light">
                      <div className="p-0.5 bg-mehendi-gold/15 rounded-full mt-0.5 shrink-0">
                        <Check className="h-3 w-3 text-mehendi-gold" />
                      </div>
                      <span className="leading-relaxed">{inc}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/booking?type=package&pkg=${pkg.id}`}
                  className="w-full inline-flex items-center justify-center bg-mehendi-dark hover:bg-mehendi-darker text-mehendi-cream text-xs uppercase font-bold tracking-widest py-4 rounded-xl border border-mehendi-gold/25 shadow-md transition-all duration-300 hover:scale-[1.01]"
                >
                  Book Bridal Package
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
