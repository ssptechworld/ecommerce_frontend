// --- Libraries
import { useEffect, type MouseEvent } from "react";
import { IoClose } from "react-icons/io5";
import { FaBox, FaUser, FaMapMarkerAlt, FaCreditCard, FaFileInvoice, FaShippingFast, FaTruck } from "react-icons/fa";

// --- Types
import type { OrderType } from "@/types/types";

// --- Utils
import { formatCurrency } from "@utils/formatCurrency";
import { formatLocalDateOnly } from "@utils/formatLocalDate";
import { getOptimizedImageUrl } from "@utils/optimizeImage";

type OrderDetailsModalProps = {
  order: OrderType | null;
  onClose: () => void;
  onGenerateInvoice?: (order: OrderType) => void;
  onPrintShippingLabel?: (order: OrderType) => void;
  onGenerateTrackingMsg?: (order: OrderType) => void;
};

const OrderDetailsModal = ({
  order,
  onClose,
  onGenerateInvoice,
  onPrintShippingLabel,
  onGenerateTrackingMsg,
}: OrderDetailsModalProps) => {
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

  const statusColor: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    processing: "bg-blue-100 text-blue-800 border-blue-300",
    shipped: "bg-purple-100 text-purple-800 border-purple-300",
    delivered: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cancelled: "bg-rose-100 text-rose-800 border-rose-300",
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-primary text-white p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FaBox className="text-warning text-lg shrink-0" />
              <h2 className="text-base sm:text-xl font-bold font-jetbrains break-all">Order #{order._id}</h2>
            </div>
            <p className="text-xs text-gray-300 mt-1">Placed on {formatLocalDateOnly(order.createdAt)}</p>
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

        {/* Action Bar inside Modal */}
        <div className="bg-gray-100 px-4 sm:px-6 py-2.5 border-b border-gray-200 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] mr-1">Quick Actions:</span>
          {onGenerateInvoice && (
            <button
              type="button"
              onClick={() => onGenerateInvoice(order)}
              className="flex items-center gap-1.5 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <FaFileInvoice className="text-amber-600" /> Invoice
            </button>
          )}
          {onPrintShippingLabel && (
            <button
              type="button"
              onClick={() => onPrintShippingLabel(order)}
              className="flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <FaShippingFast className="text-emerald-600" /> Shipping Label
            </button>
          )}
          {onGenerateTrackingMsg && (
            <button
              type="button"
              onClick={() => onGenerateTrackingMsg(order)}
              className="flex items-center gap-1.5 bg-white hover:bg-blue-50 text-blue-800 border border-blue-300 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <FaTruck className="text-blue-600" /> Tracking Message
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Status & Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            {/* Customer Info */}
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-primary mb-1">
                <FaUser className="text-gray-400" /> Customer Details
              </div>
              <p className="font-semibold text-gray-800">{order.customerName}</p>
              <p className="text-gray-500">{order.email}</p>
            </div>

            {/* Shipping Info */}
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-primary mb-1">
                <FaMapMarkerAlt className="text-gray-400" /> Shipping Address
              </div>
              <p className="text-gray-700">
                {order.shippingAddress.street}, {order.shippingAddress.area}
              </p>
              <p className="text-gray-700">{order.shippingAddress.city}</p>
              {order.shippingAddress.phone && (
                <p className="text-gray-500">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>

            {/* Order Status & Payment */}
            <div className="sm:col-span-2 pt-2 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${
                    statusColor[order.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <FaCreditCard className="text-gray-400" />
                <span>Payment: <strong className="uppercase">{order.paymentMethod}</strong></span>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div>
            <h3 className="font-bold text-primary text-sm sm:text-base font-jetbrains mb-3 flex items-center justify-between">
              <span>Ordered Products ({order.orderItems.length})</span>
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[460px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-[11px] uppercase tracking-wider border-b border-gray-200">
                    <th className="p-3">Product</th>
                    <th className="p-3 text-center">Unit Price</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {order.orderItems.map((item, idx) => (
                    <tr key={item.productId || idx} className="hover:bg-gray-50">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={getOptimizedImageUrl(item.image, 100)}
                          alt={item.title}
                          className="w-12 h-12 object-contain border rounded-md bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-primary truncate max-w-xs">{item.title}</p>
                          {item.category && <p className="text-[11px] text-gray-400 capitalize">{item.category}</p>}
                        </div>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap text-gray-600">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="p-3 text-center font-bold text-gray-800">{item.count}</td>
                      <td className="p-3 text-right font-bold text-primary whitespace-nowrap">
                        {formatCurrency(item.price * item.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">Total Amount: </span>
            <span className="text-xl font-bold text-primary font-jetbrains">{formatCurrency(order.totalPrice)}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-primary text-white hover:bg-primary/90 px-5 py-2 rounded-md font-semibold text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
