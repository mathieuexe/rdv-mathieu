import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const gilroy = localFont({
  src: "./Gilroy.woff",
  variable: "--font-gilroy",
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
    <html lang="fr" className={`${gilroy.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
