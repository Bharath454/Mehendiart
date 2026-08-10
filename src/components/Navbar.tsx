"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Calendar, LogOut, LayoutDashboard, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Bridal Packages", href: "/#bridal-packages" },
  { name: "Guest Mehendi", href: "/#guest-mehendi" },
  { name: "Gallery", href: "/#gallery" },
  { name: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<{ authenticated: boolean; role?: "admin" | "user"; name?: string; email?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Scroll detection for navbar styling
  useEffect(() => {
    // Check immediately on mount (handles refresh at scrolled position)
    const checkScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement?.scrollTop || document.body?.scrollTop || 0;
      setScrolled(scrollPos > 10);
    };
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  // Close mobile menu when pathname changes to let page transition occur before menu collapses
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Fetch session on mount / path change
  useEffect(() => {
    async function getSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    getSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setSession({ authenticated: false });
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToTarget = (targetId: string) => {
    const elem = document.getElementById(targetId);
    if (elem) {
      const navHeight = window.innerWidth < 640 ? 64 : 72;
      const elementPosition = elem.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Handle navigation links, supporting scroll or redirect
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex !== -1) {
      const targetId = href.slice(hashIndex + 1);
      if (pathname === "/") {
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          setTimeout(() => {
            scrollToTarget(targetId);
          }, 320);
        } else {
          scrollToTarget(targetId);
        }
      } else {
        // Going to different page's hash, close drawer immediately
        setIsOpen(false);
      }
    }
  };

  // Logo click — if already on home, scroll to top smoothly
  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md border-b border-mehendi-gold/25 lg:bg-transparent lg:shadow-none lg:border-transparent py-2 sm:py-2.5 lg:py-2.5 ${(scrolled || pathname !== "/" || isOpen)
        ? "lg:bg-white lg:shadow-md lg:border-b lg:border-mehendi-gold/25 lg:py-2"
        : "lg:py-3"
        }`}
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo Brand */}
          <Link href="/" onClick={handleLogoClick} className="flex items-center space-x-1.5 sm:space-x-2.5 group min-w-0">
            {/* Circular logo — logo's own gold ring fills edge-to-edge */}
            <div className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11 rounded-full overflow-hidden transition-all duration-300 shadow-md group-hover:scale-105" style={{ backgroundColor: "#faf5ef" }}>
              <Image
                src="/logo.png"
                alt="Chennai Mehendi Art Logo"
                height={44}
                width={44}
                className="h-full w-full object-contain scale-[1.13]"
                priority
              />
            </div>
            {/* Brand name */}
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-xs sm:text-base lg:text-lg tracking-wide uppercase whitespace-nowrap" style={{ color: "#2d6a2d" }}>
                Chennai Mehendi Art
              </span>
              <span className="font-semibold text-[9px] sm:text-[11px] lg:text-xs tracking-wider font-sans group-hover:text-mehendi-gold transition-colors duration-300 whitespace-nowrap hidden min-[360px]:block mt-0.5" style={{ color: "#9c7627" }}>
                Shahira Mehendi
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 ml-8 xl:ml-14">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                }}
                className="font-bold text-mehendi-darker hover:text-mehendi-gold transition-colors duration-200 text-xs xl:text-sm tracking-wide relative group py-2 whitespace-nowrap"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mehendi-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

            {/* Dynamic Auth display in Header */}
            {session?.authenticated ? (
              <>
                {session.role === "admin" ? (
                  <Link
                    href="/admin/dashboard"
                    className="font-bold text-mehendi-gold hover:text-mehendi-darker transition-all text-xs xl:text-sm tracking-wide flex items-center space-x-1"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    href="/my-bookings"
                    className="flex items-center space-x-1.5 text-xs xl:text-sm text-mehendi-darker hover:text-mehendi-gold transition-colors duration-200 font-bold py-2 whitespace-nowrap group relative"
                  >
                    <UserCheck className="h-4 w-4 text-mehendi-gold shrink-0" />
                    <span>My Bookings</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-mehendi-gold transition-all duration-300 group-hover:w-full" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="font-bold text-red-600 hover:text-red-700 transition-colors text-xs xl:text-sm flex items-center space-x-1.5"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="font-bold text-mehendi-darker hover:text-mehendi-gold transition-all text-xs xl:text-sm tracking-wider uppercase border-b border-transparent hover:border-mehendi-gold py-2"
              >
                Login
              </Link>
            )}

            {/* CTA Book Now Button */}
            <Link
              href="/booking"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-mehendi-dark to-mehendi-olive text-mehendi-cream font-medium px-4 xl:px-5 py-2 xl:py-2.5 rounded-full hover:shadow-[0_4px_12px_rgba(53,94,59,0.3)] hover:scale-105 transition-all duration-300 border border-mehendi-gold/30 whitespace-nowrap text-sm"
            >
              <Calendar className="h-4 w-4 text-mehendi-gold shrink-0" />
              <span>Book Appointment</span>
            </Link>
          </div>

          {/* Mobile + Tablet menu button and quick Book button */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 lg:hidden shrink-0">
            <Link
              href="/booking"
              className="hidden sm:inline-flex items-center space-x-1 bg-gradient-to-r from-mehendi-dark to-mehendi-olive text-mehendi-cream font-medium px-3.5 py-1.5 rounded-full border border-mehendi-gold/30 shadow-sm active:scale-95 transition-transform text-xs uppercase tracking-wider whitespace-nowrap"
            >
              <Calendar className="h-3.5 w-3.5 text-mehendi-gold shrink-0" />
              <span>Book</span>
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="h-11 w-11 flex items-center justify-center rounded-lg text-mehendi-dark hover:text-mehendi-gold hover:bg-mehendi-dark/5 transition-colors focus:outline-none shrink-0"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile + Tablet Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-b border-mehendi-gold/20 overflow-hidden shadow-lg"
          >
            <div className="px-4 sm:px-8 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.href);
                  }}
                  className="block px-4 py-3 rounded-lg font-bold text-mehendi-darker hover:text-mehendi-gold hover:bg-mehendi-dark/5 transition-all text-sm sm:text-base border-l-2 border-transparent hover:border-mehendi-gold"
                >
                  {link.name}
                </Link>
              ))}

              {/* Book Appointment CTA */}
              <div className="pt-3 px-2">
                <Link
                  href="/booking"
                  className="w-full justify-center inline-flex items-center space-x-2 bg-gradient-to-r from-mehendi-dark to-mehendi-olive text-mehendi-cream font-medium px-5 py-3 rounded-full shadow-md hover:opacity-95 transition-all border border-mehendi-gold/30 text-sm sm:text-base"
                >
                  <Calendar className="h-5 w-5 text-mehendi-gold shrink-0" />
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
