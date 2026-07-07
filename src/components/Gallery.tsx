"use client";

import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper image list: 30 custom mehendi designs organized by category
const galleryImages = [
  // Bridal (3 images)
  {
    id: "g1",
    category: "Bridal",
    src: "/api/local-image?name=bridal1",
    title: "Bridal Mehendi Design 1",
  },
  {
    id: "g2",
    category: "Bridal",
    src: "/api/local-image?name=bridal2",
    title: "Bridal Mehendi Design 2",
  },
  {
    id: "g3",
    category: "Bridal",
    src: "/api/local-image?name=bridal3",
    title: "Bridal Mehendi Design 3",
  },

  // Arabic (4 images)
  {
    id: "g7",
    category: "Arabic",
    src: "/api/local-image?name=arabic1",
    title: "Arabic Design 1",
  },
  {
    id: "g8",
    category: "Arabic",
    src: "/api/local-image?name=arabic2",
    title: "Arabic Design 2",
  },
  {
    id: "g9",
    category: "Arabic",
    src: "/api/local-image?name=arabic3",
    title: "Arabic Design 3",
  },
  {
    id: "g10",
    category: "Arabic",
    src: "/api/local-image?name=arabic4",
    title: "Arabic Design 4",
  },

  // Indian (5 images)
  {
    id: "g12",
    category: "Indian",
    src: "/api/local-image?name=indian1",
    title: "Indian Design 1",
  },
  {
    id: "g13",
    category: "Indian",
    src: "/api/local-image?name=indian2",
    title: "Indian Design 2",
  },
  {
    id: "g14",
    category: "Indian",
    src: "/api/local-image?name=indian3",
    title: "Indian Design 3",
  },
  {
    id: "g15",
    category: "Indian",
    src: "/api/local-image?name=indian4",
    title: "Indian Design 4",
  },
  {
    id: "g16",
    category: "Indian",
    src: "/api/local-image?name=indian5",
    title: "Indian Design 5",
  },

  // Festival (5 images - mixture)
  {
    id: "g17",
    category: "Festival",
    src: "/api/local-image?name=bridal1",
    title: "Festival Design 1",
  },
  {
    id: "g18",
    category: "Festival",
    src: "/api/local-image?name=arabic1",
    title: "Festival Design 2",
  },
  {
    id: "g19",
    category: "Festival",
    src: "/api/local-image?name=indian1",
    title: "Festival Design 3",
  },
  {
    id: "g20",
    category: "Festival",
    src: "/api/local-image?name=bridal2",
    title: "Festival Design 4",
  },
  {
    id: "g21",
    category: "Festival",
    src: "/api/local-image?name=arabic2",
    title: "Festival Design 5",
  },

  // Engagement (5 images - mixture)
  {
    id: "g22",
    category: "Engagement",
    src: "/api/local-image?name=indian2",
    title: "Engagement Design 1",
  },
  {
    id: "g23",
    category: "Engagement",
    src: "/api/local-image?name=bridal3",
    title: "Engagement Design 2",
  },
  {
    id: "g24",
    category: "Engagement",
    src: "/api/local-image?name=arabic3",
    title: "Engagement Design 3",
  },
  {
    id: "g25",
    category: "Engagement",
    src: "/api/local-image?name=indian3",
    title: "Engagement Design 4",
  },
  {
    id: "g26",
    category: "Engagement",
    src: "/api/local-image?name=arabic4",
    title: "Engagement Design 5",
  },

  // Baby Shower (4 images - mixture)
  {
    id: "g27",
    category: "Baby Shower",
    src: "/api/local-image?name=bridal1",
    title: "Baby Shower Design 1",
  },
  {
    id: "g28",
    category: "Baby Shower",
    src: "/api/local-image?name=indian4",
    title: "Baby Shower Design 2",
  },
  {
    id: "g29",
    category: "Baby Shower",
    src: "/api/local-image?name=arabic2",
    title: "Baby Shower Design 3",
  },
  {
    id: "g30",
    category: "Baby Shower",
    src: "/api/local-image?name=indian5",
    title: "Baby Shower Design 4",
  },
];

const categories = ["All", "Bridal", "Arabic", "Indian", "Festival", "Engagement", "Baby Shower"];

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // Filter images based on active tab category
  const filteredImages =
    activeCategory === "All"
      ? galleryImages
      : galleryImages.filter((img) => img.category === activeCategory);

  const openLightbox = (id: string) => {
    const index = filteredImages.findIndex((img) => img.id === id);
    if (index !== -1) {
      setLightboxIndex(index);
      setZoomScale(1);
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setZoomScale(1);
  };

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1));
    setZoomScale(1);
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0));
    setZoomScale(1);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.min(prev + 0.25, 2.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  };

  return (
    <section id="gallery" className="py-20 bg-mehendi-bg relative overflow-hidden">
      <div className="absolute inset-0 pattern-overlay opacity-20" />
      
      {/* Decorative Gold Dividers */}
      <div className="flex justify-center mb-4">
        <Sparkles className="h-6 w-6 text-mehendi-gold" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-mehendi-darker tracking-wide mb-4">
            Design Gallery
          </h2>
          <p className="text-mehendi-darker/70 font-light text-sm sm:text-base leading-relaxed">
            Browse through our portfolio of intricate, hand-drawn mehendi designs. Filter by category to find the perfect styling inspiration for your occasion.
          </p>
          <div className="w-24 h-0.5 bg-mehendi-gold mx-auto mt-6" />
        </div>

        {/* Filter Categories Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                closeLightbox();
              }}
              className={`px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm tracking-wide transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-mehendi-dark text-mehendi-cream border border-mehendi-gold shadow-md"
                  : "bg-white text-mehendi-dark border border-mehendi-gold/10 hover:border-mehendi-gold/40 hover:bg-mehendi-dark/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid Layout */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img) => (
              <motion.div
                layout
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => openLightbox(img.id)}
                className="relative group aspect-square rounded-2xl overflow-hidden border border-mehendi-gold/10 shadow-md hover:shadow-xl transition-all duration-300 cursor-zoom-in"
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Title & Zoom Info overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 z-20">
                  <span className="text-[10px] text-mehendi-gold uppercase tracking-wider font-bold mb-1">
                    {img.category}
                  </span>
                  <h4 className="font-serif font-semibold text-white text-sm tracking-wide">
                    {img.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Dynamic Lightbox Modal */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
              className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center p-4 select-none"
            >
              {/* Close, Zoom Toolbar */}
              <div className="absolute top-4 right-4 flex items-center space-x-4 z-[110]">
                <button
                  onClick={handleZoomIn}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
                  title="Zoom In"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <button
                  onClick={closeLightbox}
                  className="p-2.5 rounded-full bg-mehendi-dark hover:bg-mehendi-dark/95 text-mehendi-cream transition-colors focus:outline-none border border-mehendi-gold/30"
                  title="Close Lightbox"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Prev Button */}
              <button
                onClick={showPrev}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none z-[110]"
                title="Previous Image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Image Frame */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()} // Prevent closing lightbox on clicking image
                className="relative max-w-full max-h-[80vh] aspect-auto flex items-center justify-center overflow-hidden"
              >
                <motion.img
                  src={filteredImages[lightboxIndex].src}
                  alt={filteredImages[lightboxIndex].title}
                  className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg border border-white/10 shadow-2xl transition-transform duration-200"
                  style={{ scale: zoomScale }}
                />
              </motion.div>

              {/* Next Button */}
              <button
                onClick={showNext}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none z-[110]"
                title="Next Image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Lightbox Footer Title */}
              <div className="absolute bottom-6 flex flex-col items-center justify-center text-center z-[110]">
                <h3 className="font-serif font-semibold text-lg text-white tracking-wide">
                  {filteredImages[lightboxIndex].title}
                </h3>
                <p className="text-xs text-mehendi-gold tracking-widest uppercase font-bold mt-1">
                  Category: {filteredImages[lightboxIndex].category} ({lightboxIndex + 1} / {filteredImages.length})
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
