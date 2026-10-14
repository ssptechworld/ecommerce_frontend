// --- Libraries
import { useEffect, type MouseEvent } from "react";
import { IoClose, IoPrint } from "react-icons/io5";
import { FaShippingFast, FaBarcode } from "react-icons/fa";

// --- Types & Config
import type { OrderType } from "@/types/types";
import { STORE_CONFIG } from "@/config/storeConfig";

// --- Utils
import { formatCurrency } from "@utils/formatCurrency";
import { formatLocalDateOnly } from "@utils/formatLocalDate";

type ShippingLabelModalProps = {
  order: OrderType | null;
  onClose: () => void;
};

export default function ShippingLabelModal({ order, onClose }: ShippingLabelModalProps) {
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

  const handlePrint = () => {
    window.print();
  };

  const isCOD = order.paymentMethod === "cash";
  const totalItemCount = order.orderItems.reduce((acc, item) => acc + item.count, 0);

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto font-sans print:p-0 print:bg-white print:static"
    >
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:w-full print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-primary text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FaShippingFast className="text-warning text-xl" />
            <h2 className="text-lg font-bold font-jetbrains">Shipping Label Generator</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <IoPrint size={16} /> Print Label
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* Shipping Label Box (Print Target) */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar print:p-0 print:overflow-visible">
          <div className="border-4 border-gray-900 rounded-lg p-5 bg-white text-gray-900 font-sans space-y-4 print:border-4 print:border-black max-w-lg mx-auto">
            {/* Header: Carrier & Order ID */}
            <div className="flex justify-between items-center border-b-2 border-gray-900 pb-3">
              <div>
                <h3 className="font-extrabold text-2xl tracking-tighter uppercase">{STORE_CONFIG.shortName} EXPRESS</h3>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Standard Parcel Delivery Service</p>
              </div>
              <div className="text-right">
                <span className="bg-black text-white font-mono font-bold text-xs px-2.5 py-1 rounded uppercase">
                  ZONE-1 / PRIORITY
                </span>
                <p className="text-[10px] font-mono text-gray-500 mt-1">ID: #{order._id.substring(0, 10).toUpperCase()}</p>
              </div>
            </div>

            {/* Simulated Barcode */}
            <div className="flex flex-col items-center justify-center py-2 bg-gray-50 border border-gray-300 rounded print:bg-white">
              <div className="flex items-center justify-center gap-1 h-12 w-full max-w-xs px-4">
                {/* SVG Barcode simulation */}
                <FaBarcode size={48} className="w-full h-full text-black" />
              </div>
              <p className="font-mono text-xs font-bold tracking-widest mt-1">*{order._id.toUpperCase()}*</p>
            </div>

            {/* FROM and TO Grid */}
            <div className="grid grid-cols-2 gap-4 border-t-2 border-b-2 border-gray-900 py-3 text-xs">
              {/* FROM */}
              <div className="border-r border-gray-400 pr-3">
                <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500 block mb-1">SHIP FROM:</span>
                <p className="font-bold text-gray-900">{STORE_CONFIG.name}</p>
                <p className="text-gray-700">{STORE_CONFIG.address.street}</p>
                <p className="text-gray-700">{STORE_CONFIG.address.city}, {STORE_CONFIG.address.country}</p>
                <p className="text-gray-700 font-mono">Tel: {STORE_CONFIG.supportPhone}</p>
              </div>

              {/* TO */}
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500 block mb-1">SHIP TO (CUSTOMER):</span>
                <p className="font-extrabold text-sm text-black">{order.customerName}</p>
                <p className="font-bold text-gray-800">{order.shippingAddress.street}</p>
                <p className="font-bold text-gray-800">{order.shippingAddress.area}, {order.shippingAddress.city}</p>
                {order.shippingAddress.phone && (
                  <p className="font-bold text-gray-900 mt-1 font-mono bg-yellow-100 px-1 py-0.5 rounded w-fit">
                    📞 {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Package Details & Payment Indicator */}
            <div className="flex justify-between items-center pt-1 text-xs">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Package Contents</p>
                <p className="font-semibold text-gray-800">{totalItemCount} Items ({order.orderItems.length} Products)</p>
                <p className="text-[10px] text-gray-500">Date: {formatLocalDateOnly(order.createdAt)}</p>
              </div>

              {/* Payment Badge */}
              <div className="text-right">
                {isCOD ? (
                  <div className="border-2 border-red-600 bg-red-50 text-red-700 p-2 rounded text-center">
                    <span className="block font-black text-xs uppercase tracking-wider">CASH ON DELIVERY</span>
                    <span className="block font-mono font-extrabold text-base text-red-900">{formatCurrency(order.totalPrice)}</span>
                  </div>
                ) : (
                  <div className="border-2 border-emerald-600 bg-emerald-50 text-emerald-800 p-2 rounded text-center">
                    <span className="block font-black text-xs uppercase tracking-wider">PREPAID / PAID ONLINE</span>
                    <span className="block font-mono font-bold text-xs text-emerald-900">DO NOT COLLECT CASH</span>
                  </div>
                )}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="border-t border-dashed border-gray-400 pt-2 text-[10px] text-gray-600 text-center font-mono">
              Handle with care. If undelivered, return to {STORE_CONFIG.shortName} Logistics Center.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

