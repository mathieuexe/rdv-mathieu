import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // L'ancienne page de présentation a été retirée : ses liens mènent à la réservation.
  // Les pages /embed sont faites pour être affichées dans une iframe sur
  // n'importe quel site : on l'autorise explicitement.
  headers() {
    return [
      {
        source: "/embed/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
    ];
  },
  redirects() {
    return [{ source: "/qui-suis-je", destination: "/", permanent: true }];
  },
  images: {
    // Les visuels de catégorie ont une URL versionnée : leur version optimisée
    // peut rester en cache un mois sans risque d'afficher une image périmée.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
