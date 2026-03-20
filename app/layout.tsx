import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SplashScreen } from "@/components/layout/splash-screen";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lumiere & Co | El Yapimi Taki Koleksiyonlari",
    template: "%s | Lumiere & Co",
  },
  description:
    "Benzersiz, el yapimi taki koleksiyonlari. Isik gibi parlayan kolyeler, yuzukler, bileklikler.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream font-sans text-charcoal antialiased">
        <SplashScreen />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
