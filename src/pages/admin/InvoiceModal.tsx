// --- Libraries
import { useEffect, type MouseEvent } from "react";
import { IoClose, IoPrint } from "react-icons/io5";
import { FaFileInvoice, FaStore } from "react-icons/fa";

// --- Types & Config
import type { OrderType } from "@/types/types";
import { STORE_CONFIG } from "@/config/storeConfig";

// --- Utils
import { formatCurrency } from "@utils/formatCurrency";
import { formatLocalDateOnly } from "@utils/formatLocalDate";

type InvoiceModalProps = {
  order: OrderType | null;
  onClose: () => void;
};

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
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

  const invoiceNumber = `INV-${order._id.substring(0, 8).toUpperCase()}`;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto font-sans print:p-0 print:bg-white print:static"
    >
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:w-full print:rounded-none">
        {/* Action Header (Hidden during print) */}
        <div className="bg-primary text-white p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FaFileInvoice className="text-warning text-xl" />
            <h2 className="text-lg font-bold font-jetbrains">Order Invoice Generator</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <IoPrint size={16} /> Print Invoice
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

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-8 flex-1 custom-scrollbar print:p-0 print:overflow-visible text-gray-800">
          {/* Top Brand & Invoice Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-2xl tracking-tight uppercase">
                <FaStore className="text-amber-500" /> {STORE_CONFIG.name}
              </div>
              <p className="text-xs text-gray-500 mt-1">{STORE_CONFIG.tagline}</p>
              <p className="text-xs text-gray-500">{STORE_CONFIG.address.street}, {STORE_CONFIG.address.city}</p>
              <p className="text-xs text-gray-500">Support: {STORE_CONFIG.supportEmail} | {STORE_CONFIG.supportPhone}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block bg-amber-100 text-amber-900 font-mono font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider print:border print:border-amber-300">
                INVOICE
              </span>
              <h3 className="font-mono font-bold text-lg text-gray-900 mt-2">{invoiceNumber}</h3>
              <p className="text-xs text-gray-500">Date: {formatLocalDateOnly(order.createdAt)}</p>
              <p className="text-xs text-gray-500 uppercase">Status: <strong className="text-emerald-600">{order.status}</strong></p>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/70 p-5 rounded-xl border border-gray-200/80 print:bg-white print:border-gray-300">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Billed To / Customer</h4>
              <p className="font-bold text-base text-gray-900">{order.customerName}</p>
              <p className="text-sm text-gray-600 mt-0.5">{order.email}</p>
              {order.shippingAddress.phone && (
                <p className="text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Shipping Destination</h4>
              <p className="text-sm font-semibold text-gray-800">{order.shippingAddress.street}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.area}, {order.shippingAddress.city}</p>
              <p className="text-sm text-gray-600 mt-1">Payment Method: <strong className="uppercase text-gray-900">{order.paymentMethod}</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Order Summary</h4>
            <div className="border border-gray-200 rounded-xl overflow-x-auto custom-scrollbar shadow-xs print:shadow-none">
              <table className="w-full min-w-[460px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider border-b border-gray-200">
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Item Description</th>
                    <th className="p-3.5 text-center">Qty</th>
                    <th className="p-3.5 text-right">Unit Price</th>
                    <th className="p-3.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {order.orderItems.map((item, index) => (
                    <tr key={item.productId || index} className="even:bg-gray-50/50">
                      <td className="p-3.5 text-gray-400 text-xs font-mono">{index + 1}</td>
                      <td className="p-3.5">
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        {item.category && <p className="text-xs text-gray-400 capitalize">Category: {item.category}</p>}
                      </td>
                      <td className="p-3.5 text-center font-bold text-gray-800">{item.count}</td>
                      <td className="p-3.5 text-right text-gray-600 whitespace-nowrap">{formatCurrency(item.price)}</td>
                      <td className="p-3.5 text-right font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(item.price * item.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Financial Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pt-4 border-t border-gray-200 gap-6">
            <div className="text-xs text-gray-500 max-w-sm space-y-1">
              <p className="font-semibold text-gray-700">Terms & Conditions:</p>
              <p>Thank you for shopping with {STORE_CONFIG.name}. For return inquiries, please contact support within 14 days of delivery.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200 print:bg-white">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Estimated Shipping:</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Tax (Included):</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-gray-200">
                <span>Grand Total:</span>
                <span className="text-amber-600 font-jetbrains">{formatCurrency(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="text-center text-xs text-gray-400 pt-6 border-t border-dashed border-gray-200">
            <p className="font-medium">Official Computer-Generated Invoice — Valid Without Signature</p>
            <p>{STORE_CONFIG.name} © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

