// --- Libraries
import React, { useEffect, useState } from "react";

// --- Local Components
import EmptyState from "@components/empty-state/EmptyState";
import OrderImages from "@pages/admin/OrderImages";

// --- RTK
import { fetchUserOrders } from "@features/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@app/hooks";

// --- Utils
import { getStatusStyles } from "@utils/helpers/statusColor";
import { formatCurrency } from "@utils/formatCurrency";
import { formatLocalDateOnly } from "@utils/formatLocalDate";
import { cn } from "@utils/cn";

// --- Main Component
const CustomerOrders = () => {
  const dispatch = useAppDispatch();

  // --- RTK State
  const { orders, loading } = useAppSelector((state) => state.orders);

  // --- Expanded Row State
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // --- Fetch Orders
  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const toggleRow = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const steps = ["pending", "processing", "shipped", "delivered"];

  return (
    <div>
      <h1 className="border-b p-5 border-body text-xl text-[#333] font-jetbrains font-bold">Orders</h1>

      {orders.length === 0 && !loading ? (
        <EmptyState
          title={"You have placed no orders yet!"}
          desc={"All your orders will be saved here for you to access their state anytime."}
        />
      ) : (
        <div className="p-2.5 overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#EFF2F3] text-neutral-700 *:whitespace-nowrap *:text-center *:text-[10px] *:px-3 *:py-2.5 *:flex-1 *:select-none *:not-last:border-r *:border-r-warning">
                <th>IMAGE</th>
                <th>ORDER ID</th>
                <th>CREATED</th>
                <th>SHIPPING ADDRESS</th>
                <th>ITEMS</th>
                <th>PRICE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(orders) &&
                orders.map((order) => {
                  const isExpanded = expandedOrderId === order._id;
                  const activeStepIndex = steps.indexOf(order.status.toLowerCase());
                  const isCancelled = order.status.toLowerCase() === "cancelled";

                  return (
                    <React.Fragment key={order._id}>
                      {/* Clickable Header Row */}
                      <tr
                        onClick={() => toggleRow(order._id)}
                        className={cn(
                          "cursor-pointer hover:bg-neutral-100 transition-colors *:whitespace-nowrap *:px-1.5 *:py-3.5 *:text-center *:text-[11px] *:select-none border-b border-neutral-200",
                          isExpanded ? "bg-neutral-50/70 font-semibold" : "even:bg-[#EFF2F3]/75"
                        )}
                      >
                        <td>
                          <OrderImages orderItems={order.orderItems} />
                        </td>
                        <td title={order._id} className="cursor-pointer font-mono uppercase text-[10px] hover:underline">
                          {order._id.substring(0, 8)}...
                        </td>
                        <td>{formatLocalDateOnly(order.createdAt)}</td>
                        <td
                          className="max-w-50 truncate"
                          title={`${order.shippingAddress.street}, ${order.shippingAddress.area}, ${order.shippingAddress.city}`}
                        >
                          {`${order.shippingAddress.city}, ${order.shippingAddress.area}`}
                        </td>
                        <td>{order.orderItems.length}</td>
                        <td>{formatCurrency(order.totalPrice)}</td>
                        <td>
                          <span
                            className={cn(
                              "mx-auto flex items-center justify-center rounded-[5px] h-7.5 w-18 text-[10px] font-bold uppercase",
                              getStatusStyles(order.status),
                            )}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>

                      {/* Expandable Detail Section */}
                      {isExpanded && (
                        <tr className="bg-neutral-50/40">
                          <td colSpan={7} className="px-8 py-6 border-b border-neutral-200">
                            <div className="flex flex-col gap-6 text-left max-w-3xl mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
                              
                              {/* 1. Item Details */}
                              <div>
                                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                                  Items In This Order
                                </h4>
                                <div className="space-y-2">
                                  {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs py-2 border-b border-neutral-200/50 last:border-0">
                                      <div className="flex items-center gap-3">
                                        <img src={item.image} alt={item.title} className="w-10 h-10 object-contain rounded bg-white p-1 border" />
                                        <div>
                                          <p className="font-semibold text-neutral-800">{item.title}</p>
                                          <p className="text-[10px] text-neutral-500 capitalize">{item.category}</p>
                                        </div>
                                      </div>
                                      <p className="text-neutral-700">
                                        {item.count} x {formatCurrency(item.price)} = <span className="font-bold">{formatCurrency(item.price * item.count)}</span>
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 2. Visual Stepper Timeline */}
                              <div>
                                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">
                                  Delivery Tracking Status
                                </h4>

                                {isCancelled ? (
                                  <div className="bg-red-500/10 border border-red-500/20 text-red-700 text-xs px-4 py-3 rounded-lg text-center font-medium">
                                    ❌ This order has been cancelled.
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between w-full mt-4 mb-6">
                                    {steps.map((step, idx) => {
                                      const isCompleted = idx <= activeStepIndex;
                                      const isCurrent = idx === activeStepIndex;

                                      return (
                                        <div key={step} className="flex-1 flex items-center relative">
                                          {/* Stepper node */}
                                          <div className="flex flex-col items-center z-10 w-full">
                                            <div
                                              className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all shadow-sm",
                                                isCompleted
                                                  ? "bg-[#34465b] text-white ring-4 ring-[#34465b]/10"
                                                  : "bg-neutral-200 text-neutral-500"
                                              )}
                                            >
                                              {idx + 1}
                                            </div>
                                            <span
                                              className={cn(
                                                "text-[9px] mt-2 capitalize font-semibold",
                                                isCurrent
                                                  ? "text-neutral-800 font-bold"
                                                  : isCompleted
                                                  ? "text-neutral-600"
                                                  : "text-neutral-400"
                                              )}
                                            >
                                              {step}
                                            </span>
                                          </div>

                                          {/* Connector line */}
                                          {idx < steps.length - 1 && (
                                            <div
                                              className={cn(
                                                "absolute h-0.5 top-3.5 -z-0 transition-all",
                                                idx < activeStepIndex ? "bg-[#34465b]" : "bg-neutral-200"
                                              )}
                                              style={{
                                                left: "calc(50% + 14px)",
                                                width: "calc(100% - 28px)",
                                              }}
                                            />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* 3. Shipping partner and tracking metadata */}
                              {order.trackingNumber && (
                                <div className="bg-neutral-100 border border-neutral-200 p-4 rounded-xl text-xs flex flex-col gap-1.5 shadow-sm">
                                  <span className="font-bold text-neutral-800 text-sm mb-1">
                                    Shipping Information
                                  </span>
                                  <div className="text-neutral-600">
                                    Courier Partner: <span className="font-bold text-neutral-800 capitalize">{order.courierPartner || "Standard Delivery"}</span>
                                  </div>
                                  <div className="text-neutral-600">
                                    Tracking ID: <span className="font-mono font-bold text-[#34465b] bg-[#34465b]/5 px-1.5 py-0.5 rounded">{order.trackingNumber}</span>
                                  </div>
                                </div>
                              )}
                              
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
