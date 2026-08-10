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
      className="relative min-h-screen lg:h-screen flex items-start lg:items-center pt-52 sm:pt-56 lg:pt-20 pb-12 lg:pb-0 overflow-hidden w-full"
    >
      {/* ── YOUR PHOTO — full background ── */}
      <img
        src="/shared-bg.jpeg"
        alt="Mehendi background"
        className="absolute inset-0 w-full h-full object-cover z-0 origin-center opacity-55"
        style={{ filter: "brightness(1.25) contrast(0.92)" }}
        loading="eager"
      />

      {/* Light cream overlay — spotlights the hand and fades the rest of the screen to solid background */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(circle at 45% 50%, rgba(250, 249, 246, 0.35) 0%, rgba(250, 249, 246, 0.65) 45%, rgba(250, 249, 246, 0.98) 90%)",
        }}
      />

      {/* ── Subtle pattern overlay ── */}
      <div className="absolute inset-0 pattern-overlay opacity-[0.06] z-[3]" />

      {/* ── Floating decorative SVG mandalas ── */}
      <div className="absolute top-[14%] left-[4%] text-amber-700/10 animate-float-slow hidden md:block z-[4]">
        <svg width="130" height="130" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="10" />
          <path d="M50 0 C40 25, 60 25, 50 40 C40 25, 60 25, 50 0" />
          <path d="M50 100 C40 75, 60 75, 50 60 C40 75, 60 75, 50 100" />
          <path d="M0 50 C25 40, 25 60, 40 50 C25 40, 25 60, 0 50" />
          <path d="M100 50 C75 40, 75 60, 60 50 C75 40, 75 60, 100 50" />
        </svg>
      </div>
      <div className="absolute top-[38%] right-[42%] text-amber-800/8 animate-float-fast hidden sm:block z-[4]">
        <svg width="60" height="60" viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="15" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="3" />
        </svg>
      </div>

      {/* ── Main content ── */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col space-y-4 sm:space-y-6 text-center lg:text-left mt-16 sm:mt-0">

            <h1
              className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-mehendi-darker leading-[1.1] tracking-wide"
            >
              <span className="text-mehendi-dark">Creating beautiful bridal memories</span>{" "}with elegant Mehendi designs
            </h1>

            <p
              className="text-sm sm:text-base lg:text-lg text-mehendi-darker/80 max-w-xl font-light leading-relaxed self-center lg:self-start"
            >
              Handcrafted organic henna patterns for brides, families, and celebrations across Chennai.
            </p>

            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-4 sm:pt-6"
            >
              <Link
                href="/booking"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-mehendi-dark text-mehendi-cream font-medium px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border border-mehendi-gold/40 shadow-lg hover:shadow-[0_6px_20px_rgba(53,94,59,0.35)] hover:bg-mehendi-darker hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-mehendi-gold shrink-0" />
                <span>Book Appointment</span>
              </Link>

              <a
                href="#bridal-packages"
                onClick={handleScrollToPackages}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-transparent text-mehendi-dark hover:text-mehendi-gold hover:bg-mehendi-dark/5 font-medium px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border-2 border-mehendi-dark/30 hover:border-mehendi-gold transition-all duration-300 text-sm sm:text-base"
              >
                <Compass className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span>View Packages</span>
              </a>
            </div>
          </div>

          {/* Luxury Arched Image Section */}
          <div
            className="lg:col-span-5 flex justify-center relative mt-12 lg:mt-0"
          >
            <div className="absolute inset-0 bg-amber-400/10 blur-xl rounded-full scale-90 -z-10" />

            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[340px] aspect-[4/5] rounded-t-full border-[6px] sm:border-[8px] border-amber-100/80 shadow-2xl overflow-hidden group">
              <div className="absolute inset-0 border-2 border-amber-400/30 rounded-t-full z-10 m-1 pointer-events-none" />
              <img
                src="/hero.jpeg"
                alt="Professional bridal Mehendi artwork on elegant hands"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none" />
            </div>

            {/* Floating Badge */}
            <div className="absolute bottom-4 -left-2 sm:bottom-6 sm:-left-4 bg-white/95 backdrop-blur shadow-xl border border-amber-300/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center space-x-2 sm:space-x-3 animate-float-medium max-w-[140px] sm:max-w-[190px]">
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-amber-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xs sm:text-sm text-mehendi-darker leading-tight">100% Organic</span>
                <span className="text-[8px] sm:text-[10px] text-mehendi-olive font-light leading-normal">
                  <span className="hidden sm:inline">Skin-Safe </span>Natural Henna
                </span>
              </div>
            </div>

            <div className="absolute top-0 right-4 text-amber-500/40 animate-pulse hidden md:block">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M0,0 C20,0 40,20 40,40" />
                <path d="M10,0 C20,10 30,20 30,40" />
              </svg>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
