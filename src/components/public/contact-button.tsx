"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { ContactModal } from "./contact-modal";

export function ContactButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-md bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-200"
      >
        <AlertCircle className="size-4" />
        Urgence / Contact
      </button>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}