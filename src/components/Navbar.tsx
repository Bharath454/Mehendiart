"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" , route: true},
  { name: "Bridal Packages", href: "/#bridal-packages" },
  { name: "Guest Mehendi", href: "/#guest-mehendi" },
  { name: "Gallery", href: "/#gallery" },
  { name: "Testimonials", href: "/#testimonials" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle navigation links, supporting scroll or redirect
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    setIsOpen(false);
    // support hrefs like '/#gallery' or '#gallery'
    const hashIndex = href.indexOf("#");
    if (hashIndex !== -1) {
      const targetId = href.slice(hashIndex + 1);
      // If already on the homepage, prevent default navigation and smooth-scroll
      if (pathname === "/") {
        e.preventDefault();
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
        }
      }
      // else allow Link to navigate to '/#id' which will load home and jump to hash
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-mehendi-bg/95 backdrop-blur-md shadow-lg border-b border-mehendi-gold/20 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="p-2 rounded-full bg-mehendi-dark/10 group-hover:bg-mehendi-dark/20 transition-all duration-300">
              <Sparkles className="h-6 w-6 text-mehendi-gold animate-pulse" />
            </span>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-xl sm:text-2xl text-mehendi-dark tracking-wide group-hover:text-mehendi-gold transition-colors duration-300">
                Chennai Mehendi Art
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-mehendi-olive font-medium">
                Premium Henna Services
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              // Use Next.js Link for internal navigation so hashes work from any route
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  if (link.route) setIsOpen(false);
                }}
                className="font-medium text-mehendi-darker hover:text-mehendi-gold transition-colors duration-200 text-sm tracking-wide relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mehendi-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            
            {/* CTA Book Now Button */}
            <Link
              href="/booking"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-mehendi-dark to-mehendi-olive text-mehendi-cream font-medium px-5 py-2.5 rounded-full hover:shadow-[0_4px_12px_rgba(53,94,59,0.3)] hover:scale-105 transition-all duration-300 border border-mehendi-gold/30"
            >
              <Calendar className="h-4 w-4 text-mehendi-gold" />
              <span>Book Appointment</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-mehendi-dark hover:text-mehendi-gold hover:bg-mehendi-dark/5 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-mehendi-bg border-b border-mehendi-gold/20 overflow-hidden shadow-inner"
          >
            <div className="px-4 pt-2 pb-6 space-y-3 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.href);
                    setIsOpen(false);
                  }}
                  className="block px-3 py-2.5 rounded-md font-medium text-mehendi-darker hover:text-mehendi-gold hover:bg-mehendi-dark/5 transition-all text-base border-l-2 border-transparent hover:border-mehendi-gold"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 px-3">
                <Link
                  href="/booking"
                  onClick={() => setIsOpen(false)}
                  className="w-full justify-center inline-flex items-center space-x-2 bg-gradient-to-r from-mehendi-dark to-mehendi-olive text-mehendi-cream font-medium px-5 py-3 rounded-full shadow-md hover:opacity-95 transition-all border border-mehendi-gold/30"
                >
                  <Calendar className="h-5 w-5 text-mehendi-gold" />
                  <span>Book Appointment</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
