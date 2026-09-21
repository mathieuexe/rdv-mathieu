import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { TrackingWrapper } from "@/components/tracking/tracking-wrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prise de rendez-vous - Mathieu CERENZIA",
  description: "Application complète de prise de rendez-vous en ligne avec espace client et back-office administrateur.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white font-sans text-slate-900">
        <div className="da-scroll-progress" aria-hidden="true" />
        <TrackingWrapper />
        {children}
      </body>
    </html>
  );
}
