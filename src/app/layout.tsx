import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["sans-serif", "latin"],
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chennai Mehendi Art | Premium Bridal Henna Artist",
  description: "Creating beautiful bridal memories with elegant, premium Mehendi designs in Chennai. Book custom packages, traditional Indian, Arabic, and event guest henna.",
  keywords: "Mehendi Artist Chennai, Bridal Mehendi, Arabic Mehendi, Indian Mehendi, Wedding Mehendi, Bridal Henna Artist, Mehendi Booking",
  metadataBase: new URL("https://chennaimehendiart.com"),
  openGraph: {
    title: "Chennai Mehendi Art | Premium Bridal Henna Artist",
    description: "Creating beautiful bridal memories with elegant, premium Mehendi designs in Chennai.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-mehendi-bg text-mehendi-darker relative bg-henna-pattern select-none md:select-text">
        <CustomCursor />
        <FloatingWhatsApp />
        {children}
      </body>
    </html>
  );
}
