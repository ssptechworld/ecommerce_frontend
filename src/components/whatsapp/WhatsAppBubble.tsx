// --- Libraries
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=9025505031&text=Hi,I%20would%20like%20to%20know%20more%20about%20your%20services";

export default function WhatsAppBubble() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 font-sans group">
      {/* Tooltip / Badge */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-gray-800 text-xs font-semibold px-3.5 py-2 rounded-full shadow-lg border border-emerald-100 animate-in fade-in slide-in-from-left-4 duration-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Chat with us on WhatsApp!</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-gray-400 hover:text-gray-600 ml-1 cursor-pointer"
            title="Dismiss notification"
          >
            <IoClose size={14} />
          </button>
        </div>
      )}

      {/* WhatsApp Floating Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/30 hover:shadow-2xl"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-white ring-2 ring-white animate-pulse">
          1
        </span>
        <FaWhatsapp size={30} className="transition-transform group-hover:rotate-12" />
      </a>
    </div>
  );
}
