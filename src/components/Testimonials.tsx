"use client";

import React, { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "OMAR ABU SAEED",
    role: "Bride",
    location: "George Town, Chennai",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Shahira Mehandi created the most breathtaking Rajasthani design for my wedding. The lines were incredibly clean, and the stain color turned out a rich, dark mahogany that lasted for over a week! Absolute professionals.",
    rating: 5,
  },
  {
    id: 2,
    name: "ayesha afreen",
    role: "Bride",
    location: "George Town, Chennai",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Their team handled mehendi for my entire family (over 45 guests!) during my sangeet. They worked so fast without compromising on detail. The Arabic vines were incredibly elegant and everyone kept asking for their contact!",
    rating: 5,
  },
  {
    id: 3,
    name: "ferose gafoor",
    role: "Maternity Client",
    location: "George Town, Chennai",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80",
    text: "I booked their Indian design for my baby shower. The artist drew a beautiful customized mother and baby silhouette surrounded by lotus mandalas. It was such a special touch. The natural organic henna had a lovely herbal scent too.",
    rating: 5,
  },
  {
    id: 4,
    name: "afridha sabreen",
    role: "Bride",
    location: "George Town, Chennai",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Incredible attention to detail! I wanted my groom's name hidden in a custom mandap pattern, and they did it so elegantly. They are hands down the best premium bridal henna artists in Chennai.",
    rating: 5,
  },
  {
    id: 5,
    name: "sherin fathima",
    role: "Bride",
    location: "George Town, Chennai",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
    text: "The artistry, stain quality, and overall service were excellent. The design looked premium and elegant, and it matched my wedding theme beautifully.",
    rating: 5,
  },
  {
    id: 6,
    name: "mohamed suhail",
    role: "Event Host",
    location: "George Town, Chennai",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    text: "Professional, punctual, and very creative. The team handled our guest mehendi beautifully and the booking process was smooth from start to finish.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);

  // Auto-scroll slider
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-8 sm:py-12 bg-white relative overflow-hidden w-full">
      <div className="absolute inset-0 pattern-overlay opacity-15" />
      
      {/* Background circles */}
      <div className="absolute top-1/2 left-10 w-72 h-72 rounded-full bg-mehendi-gold/5 blur-3xl -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-6 w-6 text-mehendi-gold" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-mehendi-darker tracking-wide mb-4">
            Loved By Our Brides
          </h2>
          <p className="text-mehendi-darker/70 font-light text-sm sm:text-base max-w-lg mx-auto">
            Read testimonials from our lovely brides and clients. Real stories, real stains, and memorable celebrations.
          </p>
          <div className="w-20 h-0.5 bg-mehendi-gold mx-auto mt-6" />
        </div>

        {/* Testimonial slider wrapper */}
        <div className="relative bg-mehendi-bg/35 border border-mehendi-gold/20 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-md">
          <Quote className="absolute top-5 left-5 h-10 sm:h-12 w-10 sm:w-12 text-mehendi-gold/15 rotate-180 shrink-0" />
          
          <div className="relative min-h-[160px] sm:min-h-[180px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonials[index].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="text-center flex flex-col items-center"
              >
                {/* Stars */}
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonials[index].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-mehendi-gold text-mehendi-gold shrink-0" />
                  ))}
                </div>

                {/* Text quote */}
                <p className="text-sm sm:text-base lg:text-lg text-mehendi-darker font-light italic leading-relaxed max-w-2xl mb-6 sm:mb-8">
                  "{testimonials[index].text}"
                </p>

                {/* Profile detail */}
                <div className="text-center">
                  <h4 className="font-serif font-bold text-mehendi-darker text-sm sm:text-base">
                    {testimonials[index].name}
                  </h4>
                  <p className="text-xs text-mehendi-olive font-light mt-0.5">
                    {testimonials[index].role} • {testimonials[index].location}
                  </p>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav Controls */}
          <div className="flex justify-center space-x-3 mt-8">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-white hover:bg-mehendi-dark hover:text-white text-mehendi-dark border border-mehendi-gold/25 transition-all shadow-xs"
              aria-label="Previous review"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white hover:bg-mehendi-dark hover:text-white text-mehendi-dark border border-mehendi-gold/25 transition-all shadow-xs"
              aria-label="Next review"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
