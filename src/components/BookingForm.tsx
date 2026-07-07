"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Calendar, User, Phone, Mail, MapPin, FileText, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
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

const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 06:00 PM",
  "06:00 PM - 09:00 PM",
];

export default function BookingForm() {
  const searchParams = useSearchParams();
  
  // Form State
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Prepopulate form using search params
  useEffect(() => {
    const type = searchParams.get("type") || "package";
    const pkg = searchParams.get("pkg") || "";
    const design = searchParams.get("design") || "";
    const sub = searchParams.get("sub") || "";

    let eventType = "";
    if (type === "package") {
      eventType = "Wedding / Bridal";
    } else if (type === "guest" && (design || sub)) {
      eventType = "Sangeet / Wedding Party";
    }

    setFormData((prev) => ({
      ...prev,
      packageOrGuest: type as "package" | "guest",
      packageName: pkg === "package1" ? "Bridal Package 1 (Basic)" : pkg === "package2" ? "Bridal Package 2 (Standard)" : pkg === "package3" ? "Bridal Package 3 (Grand Royal)" : "",
      designType: design === "arabic" ? "Arabic" : design === "indian" ? "Indian" : "",
      subDesignName: sub ? sub.charAt(0).toUpperCase() + sub.slice(1).replace("-", " ") : "",
      eventType: eventType,
    }));
  }, [searchParams]);

  // Fetch blocked dates on mount
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        setLoadingBlocked(true);
        const res = await fetch("/api/bookings");
        if (res.ok) {
          const data = await res.json();
          setBlockedDates(data.blockedDates || []);
        }
      } catch (err) {
        console.error("Failed to fetch blocked dates", err);
      } finally {
        setLoadingBlocked(false);
      }
    };
    fetchBlockedDates();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectDate = (date: string) => {
    setFormData((prev) => ({ ...prev, date }));
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

      // Success flow
      setCreatedBooking(result.booking);
      setIsSuccess(true);
      
      // Dynamic Confetti Explosion
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
          
          <h2 className="font-serif text-3xl font-bold text-mehendi-darker tracking-wide mb-3">
            Booking Received!
          </h2>
          <p className="text-mehendi-olive font-medium text-sm sm:text-base mb-8">
            Your booking request has been received successfully.
          </p>

          <div className="w-full bg-mehendi-bg/40 border border-mehendi-gold/15 rounded-2xl p-6 mb-8 text-left space-y-4">
            <h3 className="font-serif font-semibold text-mehendi-dark pb-2 border-b border-mehendi-gold/10">
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
                    : `${createdBooking.designType} Arabic/Indian (${createdBooking.subDesignName})`}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-mehendi-olive/80 block uppercase tracking-wider font-semibold">Venue Address</span>
                <span className="font-medium">{createdBooking.address}</span>
              </div>
              <div className="col-span-2 border-t border-mehendi-gold/10 pt-3 flex justify-between items-center">
                <span className="font-medium text-mehendi-dark font-serif">Estimated Amount:</span>
                <span className="text-lg font-serif font-bold text-mehendi-dark">₹{createdBooking.price}</span>
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
    <div className="w-full bg-white rounded-3xl border border-mehendi-gold/20 shadow-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        
        {/* Left Side: Booking Fields Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 p-5 sm:p-8 lg:p-10 space-y-6">
          <div className="border-b border-mehendi-gold/10 pb-4">
            <h3 className="font-serif text-2xl font-bold text-mehendi-darker">Schedule Your Appointment</h3>
            <p className="text-xs text-mehendi-olive/80 font-light mt-1">Please enter your wedding event coordinates below.</p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
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
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm"
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="mobile" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
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
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
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
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm"
              />
            </div>

            {/* Event Type */}
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="eventType" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 text-mehendi-gold" />
                <span>Event Type *</span>
              </label>
              <select
                id="eventType"
                name="eventType"
                required
                value={formData.eventType}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm bg-white"
              >
                <option value="">-- Select Occasion --</option>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Toggle (Bridal Package OR Guest Design) */}
          <div className="border-t border-mehendi-gold/10 pt-4 flex flex-col space-y-3">
            <span className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider">Service Type *</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, packageOrGuest: "package", designType: "", subDesignName: "" }))}
                className={`py-3 rounded-xl border font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${
                  formData.packageOrGuest === "package"
                    ? "bg-mehendi-dark text-mehendi-cream border-mehendi-gold shadow-sm"
                    : "bg-white text-mehendi-dark border-mehendi-gold/20 hover:bg-mehendi-gold/5"
                }`}
              >
                Bridal Package
              </button>
              
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, packageOrGuest: "guest", packageName: "" }))}
                className={`py-3 rounded-xl border font-semibold text-xs uppercase tracking-wider transition-all duration-200 ${
                  formData.packageOrGuest === "guest"
                    ? "bg-mehendi-dark text-mehendi-cream border-mehendi-gold shadow-sm"
                    : "bg-white text-mehendi-dark border-mehendi-gold/20 hover:bg-mehendi-gold/5"
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
              <label htmlFor="packageName" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider">Select Bridal Package *</label>
              <select
                id="packageName"
                name="packageName"
                value={formData.packageName}
                onChange={handleChange}
                className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm bg-white"
              >
                <option value="">-- Select Package --</option>
                <option value="Bridal Package 1 (Basic)">Bridal Package 1 - Both hands till elbow (₹3500)</option>
                <option value="Bridal Package 2 (Standard)">Bridal Package 2 - Hands till elbow + simple legs (₹4000)</option>
                <option value="Bridal Package 3 (Grand Royal)">Bridal Package 3 - Hands till elbow + legs till ankle (₹4500)</option>
              </select>
            </div>
          ) : (
            /* Guest Mehendi selector */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
              {/* Design Type */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="designType" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider">Design Style *</label>
                <select
                  id="designType"
                  name="designType"
                  value={formData.designType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, designType: e.target.value, subDesignName: "" }))}
                  className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm bg-white"
                >
                  <option value="">-- Style --</option>
                  <option value="Arabic">Arabic Designs</option>
                  <option value="Indian">Traditional Indian</option>
                </select>
              </div>

              {/* Sub Design Area */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="subDesignName" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider">Coverage Area *</label>
                <select
                  id="subDesignName"
                  name="subDesignName"
                  value={formData.subDesignName}
                  disabled={!formData.designType}
                  onChange={handleChange}
                  className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">-- Area --</option>
                  {formData.designType === "Arabic" ? (
                    <>
                      <option value="Palm">Palm Coverage (₹50)</option>
                      <option value="Wrist">Wrist Length (₹100)</option>
                      <option value="Half Hand">Half Hand Coverage (₹150)</option>
                      <option value="Elbow">Elbow Length (₹250)</option>
                    </>
                  ) : (
                    <>
                      <option value="Palm">Palm Coverage (₹100)</option>
                      <option value="Wrist">Wrist Length (₹150)</option>
                      <option value="Half Hand">Half Hand Coverage (₹250)</option>
                      <option value="3/4 Hand">3/4 Hand Length (₹350)</option>
                      <option value="Elbow">Elbow Length (₹450)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Time Slot Selector */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="timeSlot" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider">Preferred Time Slot *</label>
            <select
              id="timeSlot"
              name="timeSlot"
              required
              value={formData.timeSlot}
              onChange={handleChange}
              className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm bg-white"
            >
              <option value="">-- Select Time Slot --</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Venue Address */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="address" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
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
              className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col space-y-1.5">
            <label htmlFor="additionalNotes" className="text-xs font-semibold text-mehendi-darker uppercase tracking-wider flex items-center space-x-1">
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
              className="px-4 py-2.5 rounded-xl border border-mehendi-gold/20 focus:border-mehendi-gold focus:ring-1 focus:ring-mehendi-gold focus:outline-none text-sm"
            />
          </div>

          {/* Hidden displays for Selected Date */}
          <div className="flex items-center space-x-3 pt-2">
            <Calendar className="h-5 w-5 text-mehendi-gold shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-mehendi-olive/80 font-semibold uppercase tracking-wider">Selected Date</span>
              <span className="text-sm font-bold text-mehendi-dark">
                {formData.date ? formData.date : "Please pick from the calendar →"}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-mehendi-dark to-mehendi-olive hover:opacity-95 text-mehendi-cream font-medium px-6 py-4 rounded-xl shadow-lg border border-mehendi-gold/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <span>Sending Booking Request...</span>
            ) : (
              <>
                <span>Confirm Booking Details</span>
                <ArrowRight className="h-4 w-4 text-mehendi-gold" />
              </>
            )}
          </button>
        </form>

        {/* Right Side: Interactive Calendar Selector */}
        <div className="lg:col-span-5 bg-mehendi-bg/30 p-5 sm:p-8 lg:p-10 border-t lg:border-t-0 lg:border-l border-mehendi-gold/10 flex flex-col justify-center">
          <div className="mb-5 sm:mb-6 text-center lg:text-left">
            <h3 className="font-serif text-lg font-semibold text-mehendi-darker">Select Event Date</h3>
            <p className="text-xs text-mehendi-olive/80 font-light mt-1">Available dates are highlighted. Click to reserve.</p>
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
