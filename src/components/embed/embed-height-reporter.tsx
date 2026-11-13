"use client";

import { useEffect } from "react";

/**
 * Transmet en continu la hauteur du widget à la page qui l'intègre, pour que
 * l'iframe s'ajuste à son contenu sans barre de défilement (voir `public/embed.js`).
 */
export function EmbedHeightReporter() {
  useEffect(() => {
    if (window.parent === window) return;

    // On mesure le contenu du widget, pas la page : celle-ci occupe toujours toute
    // la hauteur de l'iframe et ne pourrait donc jamais rétrécir.
    const content = document.querySelector<HTMLElement>(".rdv-embed");

    if (!content) return;

    let lastHeight = 0;

    const report = () => {
      const height = Math.ceil(content.getBoundingClientRect().height);

      if (height !== lastHeight) {
        lastHeight = height;
        window.parent.postMessage({ type: "rdv-embed:height", height }, "*");
      }
    };

    const observer = new ResizeObserver(report);
    observer.observe(content);
    report();

    return () => observer.disconnect();
  }, []);

  return null;
}
