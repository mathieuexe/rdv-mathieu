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
        className="da-btn da-btn-sm border border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300 hover:bg-amber-100"
      >
        <AlertCircle className="size-4" />
        Urgence / Contact
      </button>

      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}