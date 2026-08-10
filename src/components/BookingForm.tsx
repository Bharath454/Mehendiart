"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, User, Phone, Mail, MapPin, FileText, Sparkles, CheckCircle2, ArrowRight, Clock, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import BookingCalendar from "./BookingCalendar";

const EVENT_TYPES = [
  "Wedding / Bridal",
  "Sangeet / Wedding Party",
  "Engagement / Roka",
  "Baby Shower (Godh Bharai)",
  "Festival (Diwali / Eid / Karwa Chauth)",
  "Corporate Event",
  "Other Celebration",
];

// Fixed 3 daily time slots
const TIME_SLOTS = [
  { id: "slot-morning", label: "Morning", time: "08:00 AM - 10:00 AM", icon: "🌅" },
  { id: "slot-afternoon", label: "Afternoon", time: "01:00 PM - 03:00 PM", icon: "☀️" },
  { id: "slot-evening", label: "Evening", time: "06:00 PM - 09:00 PM", icon: "🌙" },
];

export default function BookingForm() {
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    eventType: "",
    packageOrGuest: "package" as "package" | "guest",
    packageName: "",
    designType: "",
    subDesignName: "",
    date: "",
    timeSlot: "",
    address: "",
    additionalNotes: "",
  });

  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  const [packages, setPackages] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // ── Fetch packages, designs, and blocked dates on mount ──
  useEffect(() => {
    const fetchServicesAndBlocked = async () => {
      try {
        setLoadingBlocked(true);
        setLoadingServices(true);
        const [packRes, desRes, blockRes] = await Promise.all([
          fetch("/api/packages"),
          fetch("/api/designs"),
          fetch("/api/bookings/blocked-dates")
        ]);
        
        if (packRes.ok) {
          const packData = await packRes.json();
          setPackages(packData.packages || []);
        }
        if (desRes.ok) {
          const desData = await desRes.json();
          setDesigns(desData.designs || []);
        }
        if (blockRes.ok) {
          const blockData = await blockRes.json();
          setBlockedDates(blockData.blockedDates || []);
        }
      } catch (err) {
        console.error("Failed to load services or blocked dates", err);
      } finally {
        setLoadingBlocked(false);
        setLoadingServices(false);
      }
    };
    fetchServicesAndBlocked();
  }, []);

  // ── Step 3: Prepopulate from URL search params (takes priority over draft) ──
  useEffect(() => {
    if (loadingServices) return;

    const type = searchParams.get("type");
    const pkg = searchParams.get("pkg") || "";
    const design = searchParams.get("design") || "";
    const sub = searchParams.get("sub") || "";

    // Only override if URL actually carries params
    if (!type && !pkg && !design && !sub) return;

    const resolvedType = (type || "package") as "package" | "guest";
    let eventType = "";
    if (resolvedType === "package") {
      eventType = "Wedding / Bridal";
    } else if (resolvedType === "guest" && (design || sub)) {
      eventType = "Sangeet / Wedding Party";
    }

    let resolvedPackageName = "";
    if (resolvedType === "package" && pkg) {
      // Find package by ObjectID or fallback keys
      let match = packages.find(p => p.id === pkg);
      if (!match) {
        if (pkg === "package1") match = packages.find(p => p.name.toLowerCase().includes("package 1"));
        else if (pkg === "package2") match = packages.find(p => p.name.toLowerCase().includes("package 2"));
        else if (pkg === "package3") match = packages.find(p => p.name.toLowerCase().includes("package 3"));
      }
      if (match) {
        resolvedPackageName = match.name;
      }
    }

    let resolvedDesignType = "";
    let resolvedSubDesignName = "";
    if (resolvedType === "guest") {
      resolvedDesignType =
        design.toLowerCase() === "arabic" ? "Arabic" :
        design.toLowerCase() === "indian" ? "Indian" : "";

      if (sub) {
        let match = designs.find(d => d.id === sub);
        if (!match) {
          const cleanSub = sub.toLowerCase().replace("-", " ");
          match = designs.find(d => d.name.toLowerCase().includes(cleanSub) || d.id.includes(sub));
        }
        if (match) {
          resolvedDesignType = match.type;
          resolvedSubDesignName = match.name;
        } else {
          resolvedSubDesignName = sub.charAt(0).toUpperCase() + sub.slice(1).replace("-", " ");
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      packageOrGuest: resolvedType,
      packageName: resolvedPackageName || prev.packageName,
      designType: resolvedDesignType || prev.designType,
      subDesignName: resolvedSubDesignName || prev.subDesignName,
      eventType: eventType || prev.eventType,
    }));
  }, [searchParams, packages, designs, loadingServices]);

  // ── Scroll to top on successful booking ──
  useEffect(() => {
    if (isSuccess) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectDate = async (date: string) => {
    // Reset slot selection and fetch availability for the new date
    setFormData((prev) => ({ ...prev, date, timeSlot: "" }));
    setBookedSlots([]);
    if (!date) return;
    try {
      setLoadingSlots(true);
      const res = await fetch(`/api/bookings/slots?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setBookedSlots(data.bookedSlots || []);
      }
    } catch (err) {
      console.error("Failed to fetch slot availability", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validation checks
    if (!formData.name || !formData.mobile || !formData.email || !formData.eventType || !formData.date || !formData.timeSlot || !formData.address) {
      setErrorMessage("Please fill in all required fields and select an available date from the calendar.");
      return;
    }

    if (formData.packageOrGuest === "package" && !formData.packageName) {
      setErrorMessage("Please select a Bridal Package.");
      return;
    }

    if (formData.packageOrGuest === "guest" && (!formData.designType || !formData.subDesignName)) {
      setErrorMessage("Please select Guest Design Type and Area.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Something went wrong. Please try again.");
      }

      setCreatedBooking(result.booking);
      setIsSuccess(true);

      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#355E3B", "#D4AF37", "#556B2F", "#FFFDD0"],
      });

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to make booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && createdBooking) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-mehendi-gold/30 shadow-2xl p-8 sm:p-12 text-center relative overflow-hidden">
        {/* Confetti container background */}
        <div className="absolute inset-0 pattern-overlay opacity-10" />

        <div className="relative z-10 flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 text-mehendi-gold mb-6 animate-bounce" />

          <h2 className="text-3xl font-extrabold text-mehendi-darker tracking-wide mb-3">
            Booking Received!
          </h2>
          <p className="text-mehendi-olive font-medium text-sm sm:text-base mb-8">
            Your booking request has been received successfully.
          </p>

          <div className="w-full bg-mehendi-bg/40 border border-mehendi-gold/15 rounded-2xl p-6 mb-8 text-left space-y-4">
            <h3 className="font-semibold text-mehendi-dark pb-2 border-b border-mehendi-gold/10">
              Booking Receipt Summary
            </h3>

            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-sm font-light text-mehendi-darker">
              <div>
                <span className="text-xs text-mehendi-olive/80 block uppercase tracking-wider font-semibold">Booking ID</span>
                <span className="font-mono font-medium">{createdBooking.id}</span>
              </div>
              <div>
                <span className="text-xs text-mehendi-olive/80 block uppercase tracking-wider font-semibold">Status</span>
                <span className="font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 uppercase text-[10px]">
                  {createdBooking.status}
                </span>
              </div>
              <div>
                <span className="text-xs text-mehendi-olive/80 block uppercase tracking-wider font-semibold">Customer Name</span>
                <span className="font-medium">{createdBooking.name}</span>
              </div>
              <div>
                <span className="text-xs text-mehendi-olive/80 block uppercase tracking-wider font-semibold">Mobile</span>
                <span className="font-medium">{createdBooking.mobile}</span>
              </div>
              <div>
                <span className="text-xs text-mehendi-olive/80 block uppercase tracking-wider font-semibold">Date & Time</span>
                <span className="font-medium">{createdBooking.date} | {createdBooking.timeSlot}</span>
              </div>
              <div>
                <span className="text-xs text-mehendi-olive/80 block uppercase tracking-wider font-semibold">Design Detail</span>
                <span className="font-medium">
                  {createdBooking.packageOrGuest === "package"
                    ? createdBooking.packageName
                    : `${createdBooking.designType} (${createdBooking.subDesignName})`}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-mehendi-olive/80 block uppercase tracking-wider font-semibold">Venue Address</span>
                <span className="font-medium">{createdBooking.address}</span>
              </div>
              <div className="col-span-2 border-t border-mehendi-gold/10 pt-3 flex justify-between items-center">
                <span className="font-medium text-mehendi-dark">Estimated Amount:</span>
                <span className="text-lg font-bold text-mehendi-dark">₹{createdBooking.price}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-mehendi-darker/70 font-light leading-relaxed max-w-md mb-8">
            An automated confirmation email has been sent to <span className="font-medium">{createdBooking.email}</span>. Our artist team will verify the date details and reach out on WhatsApp to coordinate further.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center space-x-2 bg-mehendi-dark text-mehendi-cream px-6 py-3 rounded-full hover:bg-mehendi-darker transition-all border border-mehendi-gold/20"
            >
              <span>Return Home</span>
            </a>

            <a
              href={`https://wa.me/919840792693?text=Hello,%20I%20just%20submitted%20a%20booking%20on%20your%20website.%20My%20booking%20ID%20is%20${createdBooking.id}.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full transition-all"
            >
              <span>Confirm on WhatsApp</span>
            </a>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-3xl border border-mehendi-gold/20 shadow-xl overflow-hidden relative z-10 min-h-[500px] bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: "url('/api/local-image?name=hero')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Rich mehendi green and gold mix-blend overlay matching the header - slightly lighter for hand visibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1A2E22]/85 via-[#1A2E22]/75 to-[#355E3B]/80 opacity-85 z-0 pointer-events-none" />
      <div className="absolute inset-0 pattern-overlay opacity-10 z-0 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch relative z-10">

        {/* Left Side: Booking Fields Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 p-5 sm:p-8 lg:p-10 space-y-6">
          <div className="border-b border-mehendi-gold/10 pb-4">
            <h3 className="text-2xl font-extrabold text-[#FCFBF9] tracking-wide">Schedule Your Appointment</h3>
            <p className="text-xs text-mehendi-gold font-light mt-1">Please enter your wedding event coordinates below.</p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-950/80 border-l-4 border-red-500 text-red-200 text-sm rounded shadow">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider flex items-center space-x-1">
                <User className="h-3.5 w-3.5 text-mehendi-gold" />
                <span>Full Name *</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Priyal Sharma"
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/30 bg-[#1A2E22]/50 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-base lg:text-sm text-[#FCFBF9] placeholder-gray-400/70"
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="mobile" className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider flex items-center space-x-1">
                <Phone className="h-3.5 w-3.5 text-mehendi-gold" />
                <span>Mobile Number *</span>
              </label>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                required
                pattern="[0-9]{10}"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit number (e.g. 9840123456)"
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/30 bg-[#1A2E22]/50 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-base lg:text-sm text-[#FCFBF9] placeholder-gray-400/70"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider flex items-center space-x-1">
                <Mail className="h-3.5 w-3.5 text-mehendi-gold" />
                <span>Email Address *</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@domain.com"
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/30 bg-[#1A2E22]/50 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-base lg:text-sm text-[#FCFBF9] placeholder-gray-400/70"
              />
            </div>

            {/* Event Type */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="eventType" className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 text-mehendi-gold" />
                <span>Event Type *</span>
              </label>
              <select
                id="eventType"
                name="eventType"
                required
                value={formData.eventType}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/30 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-base lg:text-sm bg-[#1A2E22]/80 text-[#FCFBF9] focus:bg-[#1A2E22]"
              >
                <option value="" className="bg-[#1A2E22]">-- Select Occasion --</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-[#1A2E22]">{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Toggle (Bridal Package OR Guest Design) */}
          <div className="border-t border-mehendi-gold/10 pt-4 flex flex-col space-y-3">
            <span className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider">Service Type *</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, packageOrGuest: "package", designType: "", subDesignName: "" }))}
                className={`py-3 rounded-xl border font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${formData.packageOrGuest === "package"
                  ? "bg-mehendi-gold text-mehendi-darker border-mehendi-gold shadow-sm"
                  : "bg-[#1A2E22]/40 text-[#FCFBF9]/80 border-mehendi-gold/30 hover:bg-[#1A2E22]/60"
                  }`}
              >
                Bridal Package
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, packageOrGuest: "guest", packageName: "" }))}
                className={`py-3 rounded-xl border font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${formData.packageOrGuest === "guest"
                  ? "bg-mehendi-gold text-mehendi-darker border-mehendi-gold shadow-sm"
                  : "bg-[#1A2E22]/40 text-[#FCFBF9]/80 border-mehendi-gold/30 hover:bg-[#1A2E22]/60"
                  }`}
              >
                Guest Designs
              </button>
            </div>
          </div>

          {/* Conditional Input Fields */}
          {formData.packageOrGuest === "package" ? (
            /* Bridal Packages selector */
            <div className="flex flex-col space-y-1.5 animate-fadeIn">
              <label htmlFor="packageName" className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider">Select Bridal Package *</label>
              <select
                id="packageName"
                name="packageName"
                value={formData.packageName}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/30 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-base lg:text-sm bg-[#1A2E22]/80 text-[#FCFBF9] focus:bg-[#1A2E22]"
              >
                <option value="" className="bg-[#1A2E22]">-- Select Package --</option>
                {packages.length > 0 ? (
                  packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.name} className="bg-[#1A2E22]">
                      {pkg.name} - {pkg.description} (₹{pkg.price})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Bridal Package 1 (Basic)" className="bg-[#1A2E22]">Bridal Package 1 - Both hands till elbow (₹3500)</option>
                    <option value="Bridal Package 2 (Standard)" className="bg-[#1A2E22]">Bridal Package 2 - Hands till elbow + simple legs (₹4000)</option>
                    <option value="Bridal Package 3 (Grand Royal)" className="bg-[#1A2E22]">Bridal Package 3 - Hands till elbow + legs till ankle (₹4500)</option>
                  </>
                )}
              </select>
            </div>
          ) : (
            /* Guest Mehendi selector */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              {/* Design Type */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="designType" className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider">Design Style *</label>
                <select
                  id="designType"
                  name="designType"
                  value={formData.designType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, designType: e.target.value, subDesignName: "" }))}
                  className="px-4 py-2.5 rounded-xl border border-mehendi-gold/30 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-base lg:text-sm bg-[#1A2E22]/80 text-[#FCFBF9] focus:bg-[#1A2E22]"
                >
                  <option value="" className="bg-[#1A2E22]">-- Style --</option>
                  <option value="Arabic" className="bg-[#1A2E22]">Arabic Designs</option>
                  <option value="Indian" className="bg-[#1A2E22]">Traditional Indian</option>
                </select>
              </div>

              {/* Sub Design Area */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="subDesignName" className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider">Coverage Area *</label>
                <select
                  id="subDesignName"
                  name="subDesignName"
                  value={formData.subDesignName}
                  disabled={!formData.designType}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-mehendi-gold/30 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-base lg:text-sm bg-[#1A2E22]/80 text-[#FCFBF9] disabled:opacity-50 disabled:cursor-not-allowed focus:bg-[#1A2E22]"
                >
                  <option value="" className="bg-[#1A2E22]">-- Area --</option>
                  {designs.length > 0 ? (
                    designs
                      .filter((d) => d.type === formData.designType)
                      .map((d) => (
                        <option key={d.id} value={d.name} className="bg-[#1A2E22]">
                          {d.name} (₹{d.price})
                        </option>
                      ))
                  ) : formData.designType === "Arabic" ? (
                    <>
                      <option value="Palm" className="bg-[#1A2E22]">Palm Coverage (₹50)</option>
                      <option value="Wrist" className="bg-[#1A2E22]">Wrist Length (₹100)</option>
                      <option value="Half Hand" className="bg-[#1A2E22]">Half Hand Coverage (₹150)</option>
                      <option value="Elbow" className="bg-[#1A2E22]">Elbow Length (₹250)</option>
                    </>
                  ) : (
                    <>
                      <option value="Palm" className="bg-[#1A2E22]">Palm Coverage (₹100)</option>
                      <option value="Wrist" className="bg-[#1A2E22]">Wrist Length (₹150)</option>
                      <option value="Half Hand" className="bg-[#1A2E22]">Half Hand Coverage (₹250)</option>
                      <option value="3/4 Hand" className="bg-[#1A2E22]">3/4 Hand Length (₹350)</option>
                      <option value="Elbow" className="bg-[#1A2E22]">Elbow Length (₹450)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Time Slot Visual Card Picker */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-mehendi-gold" />
                <span>Preferred Time Slot *</span>
              </label>
              {formData.date && (
                <span className="text-[11px] text-[#FCFBF9]/70 font-light">
                  {loadingSlots ? "Checking availability..." : `${3 - bookedSlots.length} slot${3 - bookedSlots.length !== 1 ? "s" : ""} available`}
                </span>
              )}
            </div>

            {!formData.date ? (
              <p className="text-xs text-[#FCFBF9]/60 italic py-3 text-center border border-dashed border-mehendi-gold/30 rounded-xl bg-[#1A2E22]/30">
                <span className="hidden lg:inline">← </span>Please select a date from the calendar <span className="lg:hidden">below </span>first
              </p>
            ) : loadingSlots ? (
              <div className="flex items-center justify-center py-4 space-x-2 text-[#FCFBF9]/70">
                <Loader2 className="h-4 w-4 animate-spin text-mehendi-gold" />
                <span className="text-xs">Loading slot availability...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot.time);
                  const isSelected = formData.timeSlot === slot.time;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isBooked}
                      onClick={() => !isBooked && setFormData((prev) => ({ ...prev, timeSlot: slot.time }))}
                      className={[
                        "relative flex flex-col items-center justify-center gap-1 p-3 rounded-xl border text-center transition-all duration-200 text-xs font-medium",
                        isBooked
                          ? "bg-red-950/40 border-red-900/40 text-red-300 cursor-not-allowed opacity-60"
                          : isSelected
                            ? "bg-mehendi-gold text-mehendi-darker border-mehendi-gold shadow-md ring-2 ring-mehendi-gold/40 scale-[1.02]"
                            : "bg-[#1A2E22]/40 border-mehendi-gold/20 text-[#FCFBF9]/90 hover:bg-[#1A2E22]/60 hover:border-mehendi-gold/40 cursor-pointer",
                      ].join(" ")}
                    >
                      <span className="text-base leading-none">{slot.icon}</span>
                      <span className={`font-semibold text-[11px] uppercase tracking-wide ${isBooked ? "line-through" : ""}`}>
                        {slot.label}
                      </span>
                      <span className={`text-[10px] leading-tight font-light ${isBooked ? "line-through" : ""}`}>
                        {slot.time}
                      </span>
                      {isBooked && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-400 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          Booked
                        </span>
                      )}
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 bg-mehendi-gold text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Venue Address */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="address" className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-mehendi-gold" />
              <span>Venue Address *</span>
            </label>
            <input
              id="address"
              name="address"
              type="text"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Full venue details in Chennai, Tamil Nadu"
              className="px-4 py-2.5 rounded-xl border border-mehendi-gold/30 bg-[#1A2E22]/50 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-base lg:text-sm text-[#FCFBF9] placeholder-gray-400/70"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="additionalNotes" className="text-xs font-semibold text-[#FCFBF9]/90 uppercase tracking-wider flex items-center space-x-1">
              <FileText className="h-3.5 w-3.5 text-mehendi-gold" />
              <span>Additional Notes</span>
            </label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              rows={3}
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Share details like design preferences, pattern customization, or special instructions..."
              className="px-4 py-2.5 rounded-xl border border-mehendi-gold/30 bg-[#1A2E22]/50 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-base lg:text-sm text-[#FCFBF9] placeholder-gray-400/70"
            />
          </div>

          {/* Selected Date display */}
          <div className="flex items-center space-x-3 pt-2">
            <Calendar className="h-5 w-5 text-mehendi-gold shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-[#FCFBF9]/80 font-semibold uppercase tracking-wider">Selected Date</span>
              <span className="text-sm font-bold text-mehendi-gold">
                {formData.date ? formData.date : <>Please pick from the calendar <span className="hidden lg:inline">→</span><span className="lg:hidden">below</span></>}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-mehendi-gold to-mehendi-gold-hover hover:opacity-95 text-[#1A2E22] font-semibold px-6 py-4 rounded-xl shadow-lg border border-mehendi-gold/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isSubmitting ? (
              <span>Sending Booking Request...</span>
            ) : (
              <>
                <span>Confirm Booking Details</span>
                <ArrowRight className="h-4 w-4 text-mehendi-darker" />
              </>
            )}
          </button>
        </form>

        {/* Right Side: Interactive Calendar Selector */}
        <div className="lg:col-span-5 bg-[#1A2E22]/30 p-5 sm:p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-mehendi-gold/15 flex flex-col justify-center">
          <div className="mb-5 sm:mb-6 text-center lg:text-left">
            <h3 className="text-lg font-bold text-[#FCFBF9]">Select Event Date</h3>
            <p className="text-xs text-mehendi-gold font-light mt-1">Available dates are highlighted. Click to reserve.</p>
          </div>

          <BookingCalendar
            selectedDate={formData.date}
            onSelectDate={handleSelectDate}
            blockedDates={blockedDates}
            loadingBlocked={loadingBlocked}
          />
        </div>

      </div>
    </div>
  );
}
