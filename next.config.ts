import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // L'ancienne page de présentation a été retirée : ses liens mènent à la réservation.
  redirects() {
    return [{ source: "/qui-suis-je", destination: "/", permanent: true }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
