import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { Loader2 } from "lucide-react";

export default function BookingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-mehendi-bg">
      <Navbar />

      <main className="flex-grow pt-20 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        {/* Subtle decorative vector circles */}
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-mehendi-gold/5 blur-3xl -z-10" />
        <div className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full bg-mehendi-dark/5 blur-3xl -z-10" />

        {/* Page title header - Luxury banner with a fixed-viewport parallax mehendi photo background */}
        <div
          className="relative max-w-2xl mx-auto mb-10 rounded-3xl border border-mehendi-gold/25 shadow-xl overflow-hidden h-28 sm:h-32 flex items-center justify-center text-center bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/api/local-image?name=hero')",
            backgroundAttachment: "fixed",
          }}
        >
          {/* Matching dark green and gold overlay for consistent continuous background flow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2E22]/85 via-[#1A2E22]/75 to-[#355E3B]/80 opacity-85 z-0 pointer-events-none" />
          <div className="absolute inset-0 pattern-overlay opacity-10 z-0 pointer-events-none" />

          {/* Text content layered above the background image */}
          <div className="relative z-10 px-6 py-4">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#FCFBF9] tracking-wider drop-shadow-md font-serif">
              Book an Appointment
            </div>

            {/* Infinite Flowing Marquee Sub-text */}
            <div className="overflow-hidden w-44 sm:w-60 mx-auto mt-1.5 h-4 flex items-center relative">
              <div className="animate-marquee-slow whitespace-nowrap inline-flex space-x-8 text-[9px] sm:text-[10px] text-mehendi-gold font-light uppercase tracking-widest font-semibold drop-shadow-sm select-none">
                <span>Secure Your Sacred Design Occasion</span>
                <span>•</span>
                <span>Shahira Mehendi Art</span>
                <span>•</span>
                <span>Bridal & Custom Styles</span>
                <span>•</span>
                <span>Secure Your Sacred Design Occasion</span>
                <span>•</span>
                <span>Shahira Mehendi Art</span>
                <span>•</span>
                <span>Bridal & Custom Styles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form component loaded inside Suspense boundary */}
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px] bg-[#1A2E22]/60 backdrop-blur-md rounded-3xl border border-mehendi-gold/15 shadow-sm text-[#FCFBF9]">
              <Loader2 className="h-10 w-10 text-mehendi-gold animate-spin mb-4" />
              <p className="text-sm font-light">Loading scheduling form details...</p>
            </div>
          }
        >
          <BookingForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
