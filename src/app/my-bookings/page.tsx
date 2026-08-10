"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MapPin, 
  DollarSign, 
  FileText, 
  Loader2, 
  ChevronRight, 
  MessageSquare, 
  Sparkles,
  Trash2
} from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string;
  name: string;
  mobile: string;
  email: string;
  eventType: string;
  packageOrGuest: "package" | "guest";
  packageName?: string;
  designType?: string;
  subDesignName?: string;
  price: number;
  date: string;
  timeSlot: string;
  address: string;
  additionalNotes?: string;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "completed";
  createdAt: string;
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Check user session
    async function checkSessionAndFetch() {
      try {
        const sessionRes = await fetch("/api/auth/me");
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json();
          setSession(sessionData);

          if (sessionData.authenticated && sessionData.role === "user") {
            // Fetch bookings
            const res = await fetch("/api/bookings/my");
            if (res.ok) {
              const data = await res.json();
              setBookings(data.bookings || []);
            } else {
              setError("Failed to load your booking details.");
            }
          }
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    checkSessionAndFetch();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) {
      return;
    }

    try {
      setCancellingId(id);
      const res = await fetch("/api/bookings/my", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();

      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
      } else {
        alert(data.error || "Failed to cancel booking.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while cancelling the booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200 uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>Pending Review</span>
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 uppercase tracking-wider">
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Approved</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 uppercase tracking-wider">
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Rejected</span>
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wider">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Cancelled</span>
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span>Completed</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative min-h-[70vh]">
        {/* Subtle decorative vector circles */}
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-mehendi-gold/5 blur-3xl -z-10" />
        <div className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full bg-mehendi-dark/5 blur-3xl -z-10" />

        {/* Page Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-mehendi-darker tracking-wide">
            My Appointments
          </h1>
          <p className="text-sm text-mehendi-olive/80 font-light mt-2">
            Track and manage your scheduled henna bookings
          </p>
          <div className="w-16 h-0.5 bg-mehendi-gold mx-auto mt-4" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 min-h-[300px]">
            <Loader2 className="h-10 w-10 text-mehendi-gold animate-spin mb-4" />
            <p className="text-sm text-mehendi-olive/80 font-light">Retrieving your appointments...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center max-w-md mx-auto">
            <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        ) : !session?.authenticated ? (
          <div className="p-8 bg-white border border-mehendi-gold/20 rounded-3xl text-center max-w-md mx-auto shadow-md">
            <AlertCircle className="h-10 w-10 text-mehendi-gold mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-mehendi-darker mb-2">Access Required</h3>
            <p className="text-xs text-mehendi-olive/80 font-light leading-relaxed mb-6">
              Please sign in to view your personalized booking status and appointment details.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center space-x-2 bg-mehendi-dark text-mehendi-cream px-6 py-3 rounded-full hover:bg-mehendi-darker transition-all border border-mehendi-gold/20 text-xs font-semibold uppercase tracking-wider"
            >
              <span>Go to Login</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 bg-white/70 border border-mehendi-gold/15 rounded-3xl text-center max-w-xl mx-auto shadow-sm">
            <Calendar className="h-12 w-12 text-mehendi-gold/40 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-mehendi-darker mb-2">No Bookings Found</h3>
            <p className="text-sm text-mehendi-olive/80 font-light max-w-sm mx-auto leading-relaxed mb-8">
              You haven't scheduled any appointments under this account yet.
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-mehendi-dark to-mehendi-olive hover:opacity-95 text-mehendi-cream px-6 py-3 rounded-full shadow-md text-xs font-semibold uppercase tracking-wider border border-mehendi-gold/20"
            >
              <span>Book Appointment Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-white rounded-3xl border border-mehendi-gold/20 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Header Band */}
                <div className="px-6 py-4.5 bg-mehendi-bg/35 border-b border-mehendi-gold/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-mehendi-dark bg-mehendi-gold/10 px-3 py-1 rounded-lg">
                      #{booking.id}
                    </span>
                    <span className="text-xs text-mehendi-olive/70 font-light">
                      Requested on {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Event details */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-mehendi-olive/70 uppercase tracking-wider block">Service Detail</span>
                      <span className="font-serif font-bold text-mehendi-dark text-base flex items-center space-x-1.5 mt-0.5">
                        <Sparkles className="h-4.5 w-4.5 text-mehendi-gold shrink-0" />
                        <span>
                          {booking.packageOrGuest === "package"
                            ? booking.packageName
                            : `${booking.designType} Style – ${booking.subDesignName}`}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-start space-x-2.5">
                      <Calendar className="h-5 w-5 text-mehendi-gold shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-mehendi-olive/80 uppercase tracking-wider">Date & Time Slot</span>
                        <span className="text-sm font-bold text-mehendi-darker mt-0.5">
                          {booking.date}
                        </span>
                        <span className="text-xs text-mehendi-olive/90 font-light mt-0.5">
                          {booking.timeSlot}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Address & Venue */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2.5">
                      <MapPin className="h-5 w-5 text-mehendi-gold shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-mehendi-olive/80 uppercase tracking-wider">Venue Address</span>
                        <span className="text-xs font-light leading-relaxed text-mehendi-darker mt-1">
                          {booking.address}
                        </span>
                      </div>
                    </div>

                    {booking.additionalNotes && (
                      <div className="flex items-start space-x-2.5">
                        <FileText className="h-5 w-5 text-mehendi-gold shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-semibold text-mehendi-olive/80 uppercase tracking-wider">Additional Notes</span>
                          <span className="text-xs font-light italic leading-relaxed text-mehendi-darker/80 mt-1 line-clamp-2">
                            "{booking.additionalNotes}"
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Pricing & Action Buttons */}
                  <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-mehendi-gold/15 pt-5 md:pt-0 md:pl-6">
                    <div>
                      <span className="text-[10px] font-bold text-mehendi-olive/70 uppercase tracking-wider block">Estimated Price</span>
                      <span className="font-serif font-black text-2xl text-mehendi-dark flex items-center mt-0.5">
                        ₹{booking.price}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-4">
                      {/* Message owner via WhatsApp directly */}
                      <a
                        href={`https://wa.me/919840792693?text=Hello,%20I'd%20like%20to%20discuss%20my%20Shahira%20Mehandi%20booking%20(ID:%20${booking.id})%20on%20${booking.date}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center space-x-2 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat on WhatsApp</span>
                      </a>

                      {/* Cancel Booking option only for pending bookings */}
                      {booking.status === "pending" && (
                        <button
                          disabled={cancellingId === booking.id}
                          onClick={() => handleCancelBooking(booking.id)}
                          className="inline-flex items-center justify-center space-x-1.5 w-full py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {cancellingId === booking.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Cancelling...</span>
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Cancel Request</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
