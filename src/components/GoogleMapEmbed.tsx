"use client";

import React, { useState } from "react";
import { MapPin, ExternalLink } from "lucide-react";

// ── Business location ──────────────────────────────────────────────────────────
const LAT  = 13.098022065420272;
const LNG  = 80.29114288523544;
const ZOOM = 18;

// Pre-built embed URL — works without an API key
const EMBED_URL =
  `https://maps.google.com/maps?q=${LAT},${LNG}&t=&z=${ZOOM}&ie=UTF8&iwloc=&output=embed`;

// Direct Google Maps short link to exact pin
const MAPS_LINK = "https://maps.app.goo.gl/6K5iHyVLd4cR3LbPA";

export default function GoogleMapEmbed() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full min-h-[340px] sm:min-h-[400px]">

      {/* Loading shimmer — hidden once iframe fires onLoad */}
      {!loaded && (
        <div className="absolute inset-0 rounded-2xl bg-mehendi-bg animate-pulse flex flex-col items-center justify-center space-y-3 z-10">
          <div className="w-10 h-10 rounded-full bg-mehendi-gold/30 flex items-center justify-center animate-bounce">
            <MapPin className="h-5 w-5 text-mehendi-gold" />
          </div>
          <span className="text-xs text-mehendi-olive font-light tracking-wide">
            Loading map…
          </span>
        </div>
      )}

      {/* ── Google Maps iframe (no API key required) ── */}
      <iframe
        title="Cheri Shahira Mehendi — George Town, Chennai"
        src={EMBED_URL}
        onLoad={() => setLoaded(true)}
        className="w-full h-full border-0"
        style={{ borderRadius: "16px", minHeight: "340px" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* ── Floating "Open in Google Maps" pill ── */}
      {loaded && (
        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 bg-white/95 backdrop-blur border border-mehendi-gold/40 text-mehendi-dark font-semibold text-xs px-4 py-2 rounded-full shadow-lg hover:bg-mehendi-dark hover:text-white transition-all duration-300 whitespace-nowrap"
        >
          <MapPin className="h-3 w-3 text-mehendi-gold shrink-0" />
          <span>Open in Google Maps</span>
          <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
        </a>
      )}
    </div>
  );
}
