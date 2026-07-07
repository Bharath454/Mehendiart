import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { Loader2 } from "lucide-react";

export default function BookingPage() {
  return (
    <>
      <Navbar />
      
      <main className="flex-grow pt-20 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative">
        {/* Subtle decorative vector circles */}
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-mehendi-gold/5 blur-3xl -z-10" />
        <div className="absolute bottom-[20%] left-[5%] w-96 h-96 rounded-full bg-mehendi-dark/5 blur-3xl -z-10" />
        
        {/* Page title header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-mehendi-darker tracking-wide">
            Book an Appointment
          </h1>
          <p className="text-sm text-mehendi-olive/80 font-light mt-2">
            Secure your preferred date and design slot with Chennai Mehendi Art.
          </p>
          <div className="w-16 h-0.5 bg-mehendi-gold mx-auto mt-4" />
        </div>

        {/* Form component loaded inside Suspense boundary to prevent static generation errors */}
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px] bg-white rounded-3xl border border-mehendi-gold/15 shadow-sm">
              <Loader2 className="h-10 w-10 text-mehendi-gold animate-spin mb-4" />
              <p className="text-sm text-mehendi-olive/80 font-light">Loading scheduling form details...</p>
            </div>
          }
        >
          <BookingForm />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
