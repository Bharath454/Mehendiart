"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail, MessageCircle, Sparkles, MapPin } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-mehendi-darker text-mehendi-bg relative border-t-2 border-mehendi-gold/30">
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-mehendi-gold to-transparent" />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <Sparkles className="h-6 w-6 text-mehendi-gold" />
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl text-mehendi-bg tracking-wide">
                  Shahira Mehandi
                </span>
                <span className="text-[9px] tracking-[0.2em] uppercase text-mehendi-gold font-medium">
                  Premium Henna Services
                </span>
              </div>
            </Link>
            <p className="text-mehendi-bg/75 text-sm leading-relaxed font-light">
              Creating beautiful, intricate bridal memories and guest mehendi designs with organic, premium henna. Elevating your wedding celebrations across Chennai.
            </p>
            {/* Social Icons */}
            <div className="flex space-x-3 pt-2">
              <a
                href="https://instagram.com/chennai_mehendi_art"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-mehendi-dark/20 border border-mehendi-gold/20 flex items-center justify-center hover:bg-mehendi-gold hover:text-mehendi-darker hover:border-mehendi-gold transition-all duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://facebook.com/Shahira Megendi"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-mehendi-dark/20 border border-mehendi-gold/20 flex items-center justify-center hover:bg-mehendi-gold hover:text-mehendi-darker hover:border-mehendi-gold transition-all duration-300"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M18 2h-3a5 5 0 0 0 -5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a
                href="https://wa.me/919840792693"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-mehendi-dark/20 border border-mehendi-gold/20 flex items-center justify-center hover:bg-mehendi-gold hover:text-mehendi-darker hover:border-mehendi-gold transition-all duration-300"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-serif text-lg font-semibold text-mehendi-gold tracking-wide border-b border-mehendi-gold/20 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm font-light text-mehendi-bg/80">
              <li>
                <a href="#home" onClick={(e) => handleLinkClick(e, "#home")} className="hover:text-mehendi-gold transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#bridal-packages" onClick={(e) => handleLinkClick(e, "#bridal-packages")} className="hover:text-mehendi-gold transition-colors">
                  Bridal Packages
                </a>
              </li>
              <li>
                <a href="#guest-mehendi" onClick={(e) => handleLinkClick(e, "#guest-mehendi")} className="hover:text-mehendi-gold transition-colors">
                  Guest Mehendi
                </a>
              </li>
              <li>
                <a href="#gallery" onClick={(e) => handleLinkClick(e, "#gallery")} className="hover:text-mehendi-gold transition-colors">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={(e) => handleLinkClick(e, "#testimonials")} className="hover:text-mehendi-gold transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <Link href="/booking" className="hover:text-mehendi-gold transition-colors">
                  Book Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-serif text-lg font-semibold text-mehendi-gold tracking-wide border-b border-mehendi-gold/20 pb-2">
              Our Services
            </h3>
            <ul className="space-y-2.5 text-sm font-light text-mehendi-bg/80">
              <li className="hover:text-mehendi-gold transition-colors cursor-default">Traditional Bridal Henna</li>
              <li className="hover:text-mehendi-gold transition-colors cursor-default">Arabic Indo-Western Designs</li>
              <li className="hover:text-mehendi-gold transition-colors cursor-default">Elegant Mandala Art</li>
              <li className="hover:text-mehendi-gold transition-colors cursor-default">Baby Shower & Engagement</li>
              <li className="hover:text-mehendi-gold transition-colors cursor-default">Festival Henna (Diwali, Karwa Chauth)</li>
              <li className="hover:text-mehendi-gold transition-colors cursor-default">Sangeet & Wedding Party Guest Service</li>
            </ul>
          </div>

          {/* Col 4: Contact Info */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-serif text-lg font-semibold text-mehendi-gold tracking-wide border-b border-mehendi-gold/20 pb-2">
              Contact Info
            </h3>
            <ul className="space-y-3.5 text-sm font-light text-mehendi-bg/85">
              <li className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-mehendi-gold shrink-0 mt-0.5" />
                <a href="tel:+919840792693" className="hover:text-mehendi-gold transition-colors">
                  +91 98407 92693
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MessageCircle className="h-5 w-5 text-mehendi-gold shrink-0 mt-0.5" />
                <a
                  href="https://wa.me/919840792693"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-mehendi-gold transition-colors"
                >
                  WhatsApp Artist
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-mehendi-gold shrink-0 mt-0.5" />
                <a href="mailto:chennaimehendiart@gmail.com" className="hover:text-mehendi-gold transition-colors break-all">
                  chennaimehendiart@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-mehendi-gold shrink-0 mt-0.5" />
                <span>No:42/87, Angappan Naicke Street, George Town, Mannady, Chennai - 600001</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Copyright */}
        <div className="border-t border-mehendi-gold/10 mt-10 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-mehendi-bg/60 font-light gap-4 sm:gap-0">
          <p>© {new Date().getFullYear()} Shahira Mehandi. All Rights Reserved.</p>
          <div className="flex space-x-6">
            <Link href="/admin/login" className="hover:text-mehendi-gold transition-colors">
              Admin Login
            </Link>
            <a href="#home" onClick={(e) => handleLinkClick(e, "#home")} className="hover:text-mehendi-gold transition-colors">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
