"use client";

import React, { useState } from "react";
import { Phone, Mail, MessageCircle, MapPin, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", message: "" });
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock sending inquiry message
    setTimeout(() => {
      setLoading(false);
      setIsSent(true);
      setFormData({ name: "", email: "", mobile: "", message: "" });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section id="contact" className="py-20 bg-mehendi-bg relative overflow-hidden">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Col 1: Details & Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-mehendi-gold/25 p-6 sm:p-10 shadow-lg flex flex-col justify-between">
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
            <div className="mt-8 pt-6 border-t border-mehendi-gold/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://wa.me/919840792693"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-3 p-3 bg-green-50 rounded-2xl border border-green-200/50 hover:bg-green-100/50 transition-colors"
              >
                <MessageCircle className="h-5 w-5 text-green-600" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-green-800">WhatsApp Chat</span>
                  <span className="text-xs text-green-900 font-medium">+91 98407 92693</span>
                </div>
              </a>
              
              <a
                href="tel:+919840792693"
                className="flex items-center space-x-3 p-3 bg-mehendi-dark/5 rounded-2xl border border-mehendi-dark/10 hover:bg-mehendi-dark/10 transition-colors"
              >
                <Phone className="h-5 w-5 text-mehendi-dark" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-mehendi-dark">Direct Call</span>
                  <span className="text-xs text-mehendi-darker font-medium">+91 98407 92693</span>
                </div>
              </a>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="mailto:shahirabanu1706@gmail.com"
                className="flex items-center space-x-3 p-3 bg-mehendi-dark/5 rounded-2xl border border-mehendi-dark/10 hover:bg-mehendi-dark/10 transition-colors"
              >
                <Mail className="h-5 w-5 text-mehendi-dark" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-mehendi-dark">Email</span>
                  <span className="text-xs text-mehendi-darker font-medium">shahirabanu1706@gmail.com</span>
                </div>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-mehendi-gold/10 hover:border-mehendi-gold/30 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-mehendi-dark">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-mehendi-dark">Instagram</span>
                  <span className="text-xs text-mehendi-darker font-medium">@chennai_mehendi_art</span>
                </div>
              </a>

              <a
                href="https://facebook.com/Shahira Megendi"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-mehendi-gold/10 hover:border-mehendi-gold/30 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-mehendi-dark">
                  <path d="M18 2h-3a5 5 0 0 0 -5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold text-mehendi-dark">Facebook</span>
                  <span className="text-xs text-mehendi-darker font-medium">Shahira Megendi</span>
                </div>
              </a>
            </div>

          </div>

          {/* Col 2: Interactive Google Map */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="relative w-full h-full min-h-[350px] rounded-3xl border-[6px] border-white shadow-xl overflow-hidden group">
              <div className="absolute inset-0 border-2 border-mehendi-gold/30 rounded-[18px] z-10 m-0.5 pointer-events-none" />
              
              {/* Embed Google Maps Chennai location */}
              <iframe
                title="Chennai Mehendi Art Studio Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.28424076735!2d80.24070081482226!3d13.065278190794586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d3886.28424076735!2d80.24070081482226!3d13.065278190794586!2sNungambakkam%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                className="w-full h-full border-0 grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                allowFullScreen={true}
                loading="lazy"
              />
            </div>
            
            {/* Map info block */}
            <div className="mt-4 flex items-start space-x-2 text-xs text-mehendi-olive font-light px-2">
              <MapPin className="h-4.5 w-4.5 text-mehendi-gold shrink-0 mt-0.5" />
              <p>Visiting Studio: No:42/87, Angappan Naicke Street, George Town, Mannady, Chennai - 600001. Prior appointment booking required.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
