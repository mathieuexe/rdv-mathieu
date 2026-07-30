import type { Metadata } from "next";
import { Cal_Sans, Inter } from "next/font/google";
import { TrackingWrapper } from "@/components/tracking/tracking-wrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const calSans = Cal_Sans({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cal-sans",
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
    <html lang="fr" className={`${inter.variable} ${calSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TrackingWrapper />
        {children}
      </body>
    </html>
  );
}
