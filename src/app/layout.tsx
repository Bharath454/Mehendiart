import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Chennai Mehendi Art",
  description: "Creating beautiful bridal memories with elegant, premium Mehendi designs in Chennai. Book custom packages, traditional Indian, Arabic, and event guest henna.",
  keywords: "Mehendi Artist Chennai, Bridal Mehendi, Arabic Mehendi, Indian Mehendi, Wedding Mehendi, Bridal Henna Artist, Mehendi Booking",
  metadataBase: new URL("https://chennaimehendiart.com"),

  openGraph: {
    title: "Chennai Mehendi Art",
    description: "Creating beautiful bridal memories with elegant, premium Mehendi designs in Chennai.",
    type: "website",
    locale: "en_IN",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF9F6",
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
      <head>
        <meta name="theme-color" content="#FAF9F6" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var key = '__scrollY';
                  if ('scrollRestoration' in history) {
                    history.scrollRestoration = 'manual';
                  }
                  
                  var pos = null;
                  try {
                    pos = sessionStorage.getItem(key);
                  } catch (e) {}
                  
                  var restoring = !!pos;
                  var targetY = pos ? parseInt(pos, 10) : 0;
                  
                  // Restore scroll position on page load
                  if (restoring) {
                    // Small delay to let the server-rendered DOM settle
                    setTimeout(function() {
                      window.scrollTo(0, targetY);
                      restoring = false;
                    }, 120);
                  }

                  // Capture scroll position on user scroll events, but ignore while restoring
                  var timeout;
                  window.addEventListener('scroll', function() {
                    if (restoring) return;
                    clearTimeout(timeout);
                    timeout = setTimeout(function() {
                      try {
                        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
                      } catch (e) {}
                    }, 100);
                  }, { passive: true });
                } catch (err) {
                  console.warn('Scroll restoration script error:', err);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-mehendi-bg text-mehendi-darker relative bg-henna-pattern select-none md:select-text">
        <CustomCursor />
        <FloatingWhatsApp />
        <div className="w-full overflow-x-hidden flex flex-col min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
