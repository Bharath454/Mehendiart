"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Compass, Sparkles } from "lucide-react";

export default function Hero() {
  const handleScrollToPackages = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById("bridal-packages");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center pt-24 pb-16 overflow-hidden bg-gradient-to-b from-mehendi-cream/40 via-mehendi-bg to-mehendi-bg"
    >
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 pattern-overlay opacity-30" />
      
      {/* Floating Mandalas / Paisleys */}
      <div className="absolute top-[15%] left-[5%] text-mehendi-gold/15 animate-float-slow hidden md:block">
        <svg width="120" height="120" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="10" />
          <path d="M50 0 C40 25, 60 25, 50 40 C40 25, 60 25, 50 0" />
          <path d="M50 100 C40 75, 60 75, 50 60 C40 75, 60 75, 50 100" />
          <path d="M0 50 C25 40, 25 60, 40 50 C25 40, 25 60, 0 50" />
          <path d="M100 50 C75 40, 75 60, 60 50 C75 40, 75 60, 100 50" />
          <path d="M15 15 C30 30, 30 30, 35 35" stroke="currentColor" strokeWidth="2" />
          <path d="M85 85 C70 70, 70 70, 65 65" stroke="currentColor" strokeWidth="2" />
          <path d="M15 85 C30 70, 30 70, 35 65" stroke="currentColor" strokeWidth="2" />
          <path d="M85 15 C70 30, 70 30, 65 35" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="absolute bottom-[10%] right-[8%] text-mehendi-dark/10 animate-float-medium hidden lg:block">
        <svg width="140" height="140" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 15 C65 5, 80 20, 75 40 C70 55, 55 70, 50 85 C45 70, 30 55, 25 40 C20 20, 35 5, 50 15 Z" />
          <circle cx="50" cy="40" r="8" fill="white" fillOpacity="0.3" />
        </svg>
      </div>

      <div className="absolute top-[40%] right-[45%] text-mehendi-olive/10 animate-float-fast hidden sm:block">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="15" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-mehendi-dark/10 text-mehendi-dark px-4 py-2 rounded-full self-center lg:self-start border border-mehendi-dark/20 text-xs font-semibold uppercase tracking-widest"
            >
              <Sparkles className="h-4.5 w-4.5 text-mehendi-gold animate-spin-slow" />
              <span>Professional Mehendi Artist</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-mehendi-darker leading-[1.1] tracking-wide"
            >
              <span className="text-mehendi-dark">Creating beautiful bridal memories</span>{" "}with elegant Mehendi designs
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-mehendi-darker/80 max-w-xl font-light leading-relaxed self-center lg:self-start"
            >
              Creating beautiful bridal memories with elegant Mehendi designs. Handcrafted organic henna patterns for brides, families, and celebrations across Chennai.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
            >
              {/* Main Booking Button */}
              <Link
                href="/booking"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-mehendi-dark text-mehendi-cream font-medium px-8 py-4 rounded-full border border-mehendi-gold/40 shadow-lg hover:shadow-[0_6px_20px_rgba(53,94,59,0.35)] hover:bg-mehendi-darker hover:scale-105 transition-all duration-300"
              >
                <Calendar className="h-5 w-5 text-mehendi-gold" />
                <span>Book Appointment</span>
              </Link>

              {/* Packages Anchor Button */}
              <a
                href="#bridal-packages"
                onClick={handleScrollToPackages}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-transparent text-mehendi-dark hover:text-mehendi-gold hover:bg-mehendi-dark/5 font-medium px-8 py-4 rounded-full border-2 border-mehendi-dark/20 hover:border-mehendi-gold transition-all duration-300"
              >
                <Compass className="h-5 w-5" />
                <span>View Packages</span>
              </a>
            </motion.div>
          </div>

          {/* Luxury Arched Image Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 flex justify-center relative"
          >
            {/* Double Arched Frame Shadow Background */}
            <div className="absolute inset-0 bg-mehendi-gold/10 blur-xl rounded-full scale-90 -z-10" />
            
            {/* The Arched Portrait Frame */}
            <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-t-full border-[8px] border-mehendi-cream shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 border-2 border-mehendi-gold/30 rounded-t-full z-10 m-1 pointer-events-none" />
              
              {/* Next.js responsive image replacement using standard img for flexibility */}
              <img
                src="/api/local-image?name=hero"
                alt="Professional bridal Mehendi artwork on elegant hands"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              
              {/* Subtle gold overlay vignette on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-mehendi-dark/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none" />
            </div>

            {/* Micro Floating Badge */}
            <div className="absolute bottom-6 -left-4 bg-white/95 backdrop-blur shadow-xl border border-mehendi-gold/30 rounded-2xl p-4 flex items-center space-x-3 animate-float-medium max-w-[190px]">
              <div className="w-10 h-10 rounded-full bg-mehendi-gold/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-mehendi-gold" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm text-mehendi-darker">100% Organic</span>
                <span className="text-[10px] text-mehendi-olive font-light">Skin-Safe Natural Henna</span>
              </div>
            </div>

            {/* Arched Border Corner Ornaments */}
            <div className="absolute top-0 right-4 text-mehendi-gold/40 animate-pulse hidden md:block">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M0,0 C20,0 40,20 40,40" />
                <path d="M10,0 C20,10 30,20 30,40" />
              </svg>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
