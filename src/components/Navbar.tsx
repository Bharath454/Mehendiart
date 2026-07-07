"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Calendar, Sparkles, LogOut, LayoutDashboard, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/", route: true },
  { name: "Bridal Packages", href: "/#bridal-packages" },
  { name: "Guest Mehendi", href: "/#guest-mehendi" },
  { name: "Gallery", href: "/#gallery" },
  { name: "Testimonials", href: "/#testimonials" },
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

  // Handle navigation links, supporting scroll or redirect
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    setIsOpen(false);
    const hashIndex = href.indexOf("#");
    if (hashIndex !== -1) {
      const targetId = href.slice(hashIndex + 1);
      if (pathname === "/") {
        e.preventDefault();
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-45 transition-all duration-300 ${
        scrolled
          ? "bg-mehendi-bg/95 backdrop-blur-md shadow-lg border-b border-mehendi-gold/20 py-2 sm:py-3"
          : "bg-transparent py-3 sm:py-5"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-2 group min-w-0">
            <span className="p-1.5 sm:p-2 rounded-full bg-mehendi-dark/10 group-hover:bg-mehendi-dark/20 transition-all duration-300 shrink-0">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-mehendi-gold animate-pulse" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-serif font-bold text-base sm:text-xl lg:text-2xl text-mehendi-dark tracking-wide group-hover:text-mehendi-gold transition-colors duration-300 truncate">
                Chennai Mehendi Art
              </span>
              <span className="hidden xs:block text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase text-mehendi-olive font-medium">
                Premium Henna Services
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(e, link.href);
                  if (link.route) setIsOpen(false);
                }}
                className="font-medium text-mehendi-darker hover:text-mehendi-gold transition-colors duration-200 text-xs xl:text-sm tracking-wide relative group py-2 whitespace-nowrap"
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
                    className="font-medium text-mehendi-gold hover:text-mehendi-dark transition-all text-xs xl:text-sm tracking-wide flex items-center space-x-1"
                  >
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-1 text-xs xl:text-sm text-mehendi-darker font-medium">
                    <UserCheck className="h-4 w-4 text-mehendi-gold" />
                    <span className="max-w-[100px] truncate">Hi, {session.name}</span>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="font-semibold text-red-600 hover:text-red-700 transition-colors text-xs xl:text-sm flex items-center space-x-1.5"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="font-semibold text-mehendi-dark hover:text-mehendi-gold transition-all text-xs xl:text-sm tracking-wider uppercase border-b border-transparent hover:border-mehendi-gold py-2"
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

          {/* Mobile + Tablet menu button */}
          <div className="lg:hidden">
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

      {/* Mobile + Tablet Drawer menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-mehendi-bg/98 backdrop-blur-md border-b border-mehendi-gold/20 overflow-hidden shadow-lg"
          >
            <div className="px-4 sm:px-8 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    handleNavClick(e, link.href);
                    setIsOpen(false);
                  }}
                  className="block px-4 py-3 rounded-lg font-medium text-mehendi-darker hover:text-mehendi-gold hover:bg-mehendi-dark/5 transition-all text-sm sm:text-base border-l-2 border-transparent hover:border-mehendi-gold"
                >
                  {link.name}
                </Link>
              ))}

              {session?.authenticated ? (
                <>
                  {session.role === "admin" ? (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-lg font-semibold text-mehendi-gold hover:bg-mehendi-dark/5 transition-all text-sm"
                    >
                      Go to Admin Dashboard
                    </Link>
                  ) : (
                    <div className="px-4 py-2 text-xs text-mehendi-olive font-semibold">
                      Logged in as: {session.name}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left block px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-all text-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg font-medium text-mehendi-darker hover:text-mehendi-gold hover:bg-mehendi-dark/5 transition-all text-sm"
                >
                  Login
                </Link>
              )}

              <div className="pt-3 px-2">
                <Link
                  href="/booking"
                  onClick={() => setIsOpen(false)}
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
