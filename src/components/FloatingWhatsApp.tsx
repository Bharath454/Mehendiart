"use client";

import React from "react";
import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/919840792693?text=Hello,%20I'm%20interested%20in%20booking%20a%20Mehendi%20session."
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-[999] flex items-center justify-center bg-[#25D366] hover:bg-[#20BA56] text-white p-4 rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 group border border-white/10"
      aria-label="Chat on WhatsApp"
    >
      {/* Pulse rings */}
      <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping group-hover:animate-none scale-105 pointer-events-none -z-10" />
      
      {/* WhatsApp Icon */}
      <MessageCircle className="h-6 w-6 text-white" />
      
      {/* Hover Tooltip tag */}
      <span className="absolute right-14 bg-mehendi-darker text-mehendi-cream text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-xl border border-mehendi-gold/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none">
        Chat with Artist
      </span>
    </a>
  );
}
