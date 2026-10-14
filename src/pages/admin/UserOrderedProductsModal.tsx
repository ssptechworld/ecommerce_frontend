// --- Libraries
import { useEffect, useMemo, type MouseEvent } from "react";
import { IoClose } from "react-icons/io5";
import { FaShoppingBag, FaCalendarAlt } from "react-icons/fa";

// --- Types
import type { UserType, OrderType } from "@/types/types";

// --- Utils
import { formatCurrency } from "@utils/formatCurrency";
import { formatLocalDateOnly } from "@utils/formatLocalDate";
import { getOptimizedImageUrl } from "@utils/optimizeImage";

type UserOrderedProductsModalProps = {
  user: UserType | null;
  orders: OrderType[];
  onClose: () => void;
};

const UserOrderedProductsModal = ({ user, orders, onClose }: UserOrderedProductsModalProps) => {
  useEffect(() => {
    if (!user) return;
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [user, onClose]);

  // Filter orders matching selected user by ID or Email
  const userOrders = useMemo(() => {
    if (!user) return [];
    return orders.filter(
      (order) =>
        order.userId === user._id ||
        (order.email && order.email.toLowerCase() === user.email.toLowerCase())
    );
  }, [user, orders]);

  // Total items and total spent calculation
  const totalItemsCount = useMemo(() => {
    return userOrders.reduce((sum, order) => {
      return sum + order.orderItems.reduce((acc, item) => acc + item.count, 0);
    }, 0);
  }, [userOrders]);

  const totalSpent = useMemo(() => {
    return userOrders.reduce((sum, order) => sum + order.totalPrice, 0);
  }, [userOrders]);

  if (!user) return null;

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
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-primary text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-11 h-11 rounded-full border-2 border-warning object-contain bg-white shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.fullName}&background=random&color=fff`;
              }}
            />
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-jetbrains flex items-center gap-2">
                {user.fullName}
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">
                  {user.role}
                </span>
              </h2>
              <p className="text-xs text-gray-300">{user.email}</p>
            </div>
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

        {/* User Order Summary Bar */}
        <div className="bg-gray-100 p-4 border-b border-gray-200 grid grid-cols-3 gap-3 text-center">
          <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-xs text-gray-500 block uppercase font-bold">Total Orders</span>
            <span className="text-lg font-bold text-primary font-jetbrains">{userOrders.length}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-xs text-gray-500 block uppercase font-bold">Total Products</span>
            <span className="text-lg font-bold text-primary font-jetbrains">{totalItemsCount}</span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="text-xs text-gray-500 block uppercase font-bold">Total Spent</span>
            <span className="text-lg font-bold text-emerald-600 font-jetbrains">{formatCurrency(totalSpent)}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {userOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-jetbrains space-y-2">
              <FaShoppingBag className="mx-auto text-4xl text-gray-300" />
              <p className="text-lg font-semibold text-gray-600">No Past Orders Found</p>
              <p className="text-xs text-gray-400">This user has not placed any orders yet.</p>
            </div>
          ) : (
            userOrders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
              >
                {/* Order Header */}
                <div className="bg-gray-50 p-3 sm:p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary font-jetbrains">Order #{order._id}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border uppercase ${
                        statusColor[order.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 text-xs">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> {formatLocalDateOnly(order.createdAt)}
                    </span>
                    <span className="font-bold text-primary text-sm">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Order Items Table */}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-100">
                      <th className="p-2.5 sm:p-3">Product</th>
                      <th className="p-2.5 sm:p-3 text-center">Unit Price</th>
                      <th className="p-2.5 sm:p-3 text-center">Qty</th>
                      <th className="p-2.5 sm:p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {order.orderItems.map((item, itemIdx) => (
                      <tr key={item.productId || itemIdx} className="hover:bg-gray-50/80">
                        <td className="p-2.5 sm:p-3 flex items-center gap-3">
                          <img
                            src={getOptimizedImageUrl(item.image, 100)}
                            alt={item.title}
                            className="w-10 h-10 object-contain border rounded bg-white shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-primary truncate max-w-xs">{item.title}</p>
                            {item.category && (
                              <p className="text-[10px] text-gray-400 capitalize">{item.category}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-2.5 sm:p-3 text-center whitespace-nowrap text-gray-600">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="p-2.5 sm:p-3 text-center font-bold text-gray-800">
                          {item.count}
                        </td>
                        <td className="p-2.5 sm:p-3 text-right font-bold text-primary whitespace-nowrap">
                          {formatCurrency(item.price * item.count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-md font-semibold text-sm transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserOrderedProductsModal;
