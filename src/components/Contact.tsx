"use client";

import React, { useState } from "react";
import { Phone, Mail, MessageCircle, MapPin, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import GoogleMapEmbed from "./GoogleMapEmbed";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", message: "" });
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsSent(true);
        setFormData({ name: "", email: "", mobile: "", message: "" });
      } else {
        const err = await response.json();
        alert(err.error || "Failed to send inquiry. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="py-14 sm:py-20 bg-mehendi-bg relative overflow-hidden w-full">
      <div className="absolute inset-0 pattern-overlay opacity-20" />

      {/* Background circles */}
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-mehendi-gold/5 blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-6 w-6 text-mehendi-gold" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-mehendi-darker tracking-wide mb-4">
            Connect With Our Studio
          </h2>
          <p className="text-mehendi-darker/70 font-light text-sm sm:text-base leading-relaxed">
            Have questions about customized bridal layouts or large-scale sangeet events? Drop us a message or contact us directly.
          </p>
          <div className="w-24 h-0.5 bg-mehendi-gold mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Col 1: Details & Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-mehendi-gold/25 p-5 sm:p-8 lg:p-10 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-mehendi-darker mb-6 border-b border-mehendi-gold/10 pb-3">
                Send an Inquiry
              </h3>
              
              {isSent ? (
                <div className="p-6 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-center space-y-3 animate-fadeIn my-10">
                  <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto" />
                  <p className="font-bold text-base">Inquiry Sent Successfully!</p>
                  <p className="text-xs text-green-700 font-light leading-relaxed">
                    Thank you for writing. Our team will get back to you within 24 hours on your email or mobile.
                  </p>
                  <button
                    onClick={() => setIsSent(false)}
                    className="mt-2 text-xs font-semibold text-mehendi-dark hover:text-mehendi-gold underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Maya Sen"
                        className="px-4 py-2 rounded-xl border border-mehendi-gold/15 focus:border-mehendi-gold outline-none text-sm"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Phone Number</label>
                      <input
                        type="tel"
                        name="mobile"
                        required
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="e.g. 9840123456"
                        className="px-4 py-2 rounded-xl border border-mehendi-gold/15 focus:border-mehendi-gold outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@domain.com"
                      className="px-4 py-2 rounded-xl border border-mehendi-gold/15 focus:border-mehendi-gold outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold text-mehendi-darker uppercase tracking-wider">Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your event dates, number of guests, or design queries..."
                      className="px-4 py-2 rounded-xl border border-mehendi-gold/15 focus:border-mehendi-gold outline-none text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center space-x-2 bg-mehendi-dark text-mehendi-cream py-3 rounded-xl border border-mehendi-gold/30 shadow-md hover:bg-mehendi-darker transition-all font-medium text-sm"
                  >
                    {loading ? (
                      <span>Sending inquiry...</span>
                    ) : (
                      <>
                        <span>Submit inquiry</span>
                        <Send className="h-4 w-4 text-mehendi-gold" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact Links in Card */}
            <div className="mt-8 pt-6 border-t border-mehendi-gold/10 grid grid-cols-2 gap-2 sm:gap-4">
              <a
                href="https://wa.me/919840792693"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 sm:space-x-3 p-2 sm:p-3 bg-green-50 rounded-xl sm:rounded-2xl border border-green-200/50 hover:bg-green-100/50 transition-colors text-left min-w-0"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-green-800 tracking-wider">WhatsApp</span>
                  <span className="text-[10px] sm:text-xs text-green-900 font-medium truncate leading-tight">+91 98407 92693</span>
                </div>
              </a>
              
              <a
                href="tel:+919840792693"
                className="flex items-center space-x-1.5 sm:space-x-3 p-2 sm:p-3 bg-mehendi-dark/5 rounded-xl sm:rounded-2xl border border-mehendi-dark/10 hover:bg-mehendi-dark/10 transition-colors text-left min-w-0"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-mehendi-dark shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-mehendi-dark tracking-wider">Call</span>
                  <span className="text-[10px] sm:text-xs text-mehendi-darker font-medium truncate leading-tight">+91 98407 92693</span>
                </div>
              </a>
            </div>

            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <a
                href="mailto:chennaimehendiart@gmail.com"
                className="flex items-center space-x-1.5 sm:space-x-3 p-2 sm:p-3 bg-mehendi-dark/5 rounded-xl sm:rounded-2xl border border-mehendi-dark/10 hover:bg-mehendi-dark/10 transition-colors text-left min-w-0"
              >
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-mehendi-dark shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-mehendi-dark tracking-wider">Email</span>
                  <span className="text-[9px] sm:text-xs text-mehendi-darker font-medium truncate leading-tight">chennaimehendiart@gmail.com</span>
                </div>
              </a>

              <a
                href="https://instagram.com/chennai_mehendi_art"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 sm:space-x-3 p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-pink-200 hover:bg-pink-50 transition-colors text-left min-w-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5 text-pink-600 shrink-0">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-pink-700 tracking-wider">Instagram</span>
                  <span className="text-[9px] sm:text-xs text-pink-600 font-medium truncate leading-tight">@chennai_mehendi_art</span>
                </div>
              </a>

              <a
                href="https://facebook.com/ShahiraMehendi"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 sm:space-x-3 p-2 sm:p-3 bg-blue-50 rounded-xl sm:rounded-2xl border border-blue-200 hover:bg-blue-100 transition-colors text-left min-w-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] sm:text-[10px] uppercase font-bold text-blue-700 tracking-wider">Facebook</span>
                  <span className="text-[9px] sm:text-xs text-blue-600 font-medium truncate leading-tight">Shahira Mehendi</span>
                </div>
              </a>
            </div>

          </div>

          {/* Col 2: Google Maps */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="relative w-full h-full rounded-3xl border-[4px] sm:border-[6px] border-white shadow-xl overflow-hidden">
              <div className="absolute inset-0 border-2 border-mehendi-gold/30 rounded-[18px] z-10 m-0.5 pointer-events-none" />
              <GoogleMapEmbed />
            </div>

            {/* Address info */}
            <div className="mt-4 flex items-start space-x-2 text-xs text-mehendi-olive font-light px-2">
              <MapPin className="h-4 w-4 text-mehendi-gold shrink-0 mt-0.5" />
              <p>No:42/87, Angappan Naicke Street, George Town, Mannady, Chennai - 600001. Prior appointment required.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
