// --- Libraries
import { useState, useEffect, type MouseEvent } from "react";
import { IoClose, IoCopy, IoCheckmarkCircle } from "react-icons/io5";
import { FaTruck, FaWhatsapp, FaExternalLinkAlt } from "react-icons/fa";

// --- Types & Config
import type { OrderType } from "@/types/types";
import { STORE_CONFIG } from "@/config/storeConfig";

type ShipmentTrackingModalProps = {
  order: OrderType | null;
  onClose: () => void;
};

const CARRIER_PRESETS = [
  { name: `${STORE_CONFIG.shortName} Express`, url: "https://express.store.com/track" },
  { name: "DHL Express", url: "https://www.dhl.com/en/express/tracking.html" },
  { name: "FedEx", url: "https://www.fedex.com/fedextrack/" },
  { name: "Aramex", url: "https://www.aramex.com/track/shipments" },
];

export default function ShipmentTrackingModal({ order, onClose }: ShipmentTrackingModalProps) {
  const [trackingUrl, setTrackingUrl] = useState("https://express.store.com/track");
  const [trackingOverride, setTrackingOverride] = useState<{ orderId: string; value: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const defaultTrackingId = order ? order.trackingNumber || `TRK-${order._id.substring(0, 8).toUpperCase()}` : "";
  const trackingId =
    order && trackingOverride?.orderId === order._id ? trackingOverride.value : defaultTrackingId;

  const setTrackingId = (value: string) => {
    if (order) {
      setTrackingOverride({ orderId: order._id, value });
    }
  };

  useEffect(() => {
    if (!order) return;
    document.body.style.overflow = "hidden";

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [order, onClose]);

  if (!order) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) onClose();
  };

  // Generate the copy-paste tracking message
  const generatedMessage = `Hi ${order.customerName}! 📦

Great news! Your order #${order._id.substring(0, 8).toUpperCase()} from ${STORE_CONFIG.name} has been dispatched and is on its way.

🔍 Tracking Details:
• Tracking ID: ${trackingId || "[Tracking ID]"}
• Track Shipment: ${trackingUrl || "[Tracking URL]"}

Thank you for shopping with ${STORE_CONFIG.name}! If you have any questions, feel free to contact us.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = generatedMessage;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // WhatsApp direct link for customer phone number if exists
  const customerPhone = order.shippingAddress?.phone
    ? order.shippingAddress.phone.replace(/[^0-9]/g, "")
    : "";
  const whatsappCustomerUrl = customerPhone
    ? `https://api.whatsapp.com/send?phone=${customerPhone}&text=${encodeURIComponent(generatedMessage)}`
    : "";

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto font-sans"
    >
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-primary text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaTruck className="text-warning text-xl" />
            <h2 className="text-lg font-bold font-jetbrains">Shipment Tracking Message Generator</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <IoClose size={22} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-sm">
          {/* Order Brief Info */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex justify-between items-center text-xs text-blue-900">
            <div>
              <span className="font-semibold text-gray-600">Customer: </span>
              <strong className="text-blue-950">{order.customerName}</strong>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Order ID: </span>
              <span className="font-mono font-bold text-blue-950">#{order._id.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Quick Carrier Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Carrier Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {CARRIER_PRESETS.map((carrier) => (
                <button
                  key={carrier.name}
                  type="button"
                  onClick={() => setTrackingUrl(carrier.url)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer ${
                    trackingUrl === carrier.url
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                  }`}
                >
                  {carrier.name}
                </button>
              ))}
            </div>
          </div>

          {/* Input 1 - Tracking URL */}
          <div>
            <label htmlFor="tracking-url-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Input 1: Tracking URL
            </label>
            <div className="relative">
              <input
                id="tracking-url-input"
                type="text"
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                placeholder="https://express.baghdadshop.com/track"
                className="w-full pl-3 pr-9 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono transition-all"
              />
              {trackingUrl && (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600"
                  title="Test link in new tab"
                >
                  <FaExternalLinkAlt size={12} />
                </a>
              )}
            </div>
          </div>

          {/* Input 2 - Tracking ID */}
          <div>
            <label htmlFor="tracking-id-input" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
              Input 2: Tracking ID
            </label>
            <input
              id="tracking-id-input"
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Tracking ID (e.g. TRK12345678)"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono transition-all"
            />
          </div>

          {/* Message Preview Box */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Generated Message (Ready to Copy & Paste)
              </label>
              {copied && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold animate-in fade-in">
                  <IoCheckmarkCircle size={16} /> Copied to Clipboard!
                </span>
              )}
            </div>
            <div className="relative">
              <textarea
                readOnly
                rows={7}
                value={generatedMessage}
                className="w-full p-4 bg-gray-900 text-amber-300 font-mono text-xs rounded-xl border border-gray-800 focus:outline-none leading-relaxed shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          {/* WhatsApp Direct Send if customer phone available */}
          {whatsappCustomerUrl ? (
            <a
              href={whatsappCustomerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <FaWhatsapp size={16} /> Send via WhatsApp
            </a>
          ) : (
            <span className="text-xs text-gray-400 italic">No phone number on order</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
            >
              {copied ? <IoCheckmarkCircle size={18} /> : <IoCopy size={16} />}
              {copied ? "Copied!" : "Copy Message"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
