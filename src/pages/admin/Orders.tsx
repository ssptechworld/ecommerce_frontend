// --- Libraries
import { useEffect, useState } from "react";

// --- Utils
import { formatCurrency } from "@utils/formatCurrency";
import { formatLocalDateOnly } from "@utils/formatLocalDate";
import { cn } from "@utils/cn";
import { FiSearch, FiX } from "react-icons/fi";
import { FaFileInvoice, FaShippingFast, FaTruck, FaEye } from "react-icons/fa";

// --- Types
import type { OrderType } from "@/types/types";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchAllOrders } from "@features/orders/ordersSlice";

// --- Local Components
import ErrorHandler from "@components/error-handler/ErrorHandler";
import SelectStatus from "@pages/admin/SelectStatus";
import OrderImages from "@pages/admin/OrderImages";
import OrderDetailsModal from "@pages/admin/OrderDetailsModal";
import InvoiceModal from "@pages/admin/InvoiceModal";
import ShippingLabelModal from "@pages/admin/ShippingLabelModal";
import ShipmentTrackingModal from "@pages/admin/ShipmentTrackingModal";

// --- Main Component
const Orders = () => {
  const { loading, orders, error } = useAppSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<OrderType | null>(null);
  const [shippingLabelOrder, setShippingLabelOrder] = useState<OrderType | null>(null);
  const [trackingMsgOrder, setTrackingMsgOrder] = useState<OrderType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const filteredOrders = orders.filter(order => 
    order._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Return JSX
  return (
    <div className="flex flex-col h-full gap-5">
      {/* Header & Search */}
      <div className="bg-white p-5 rounded-md shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-primary font-jetbrains">Orders Management</h1>
          <p className="text-sm text-gray-500">Manage, print invoices, shipping labels, and track customer orders ({orders.length})</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID..."
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-primary text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => setSearchTerm("")}
            >
              <FiX size={14} />
            </button>
          )}
        </div>
      </div>

      <section className="flex-1 bg-white rounded-md shadow-sm overflow-hidden flex flex-col min-h-125">
        {error ? (
          <div className="flex-1 flex items-center justify-center p-5">
            <ErrorHandler error={error} />
          </div>
        ) : (
          <div
            className={cn(
              "overflow-auto custom-scrollbar flex-1 transition-opacity duration-300",
              loading ? "opacity-50" : "opacity-100",
            )}
          >
            <table className="w-full min-w-max relative border-separate border-spacing-0">
              <thead>
                <tr className="sticky top-0 z-10 bg-[#EFF2F3] shadow-sm text-neutral-700 *:whitespace-nowrap *:text-center *:text-[10px] *:px-3 *:py-2.5 *:flex-1 *:not-last:border-r *:border-r-warning">
                  <th>IMAGE</th>
                  <th>ORDER ID</th>
                  <th>CREATED</th>
                  <th>SHIPPING ADDRESS</th>
                  <th>ITEMS</th>
                  <th>PRICE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="even:bg-[#EFF2F3]/75 hover:bg-gray-500/10 transition-colors duration-200 *:whitespace-nowrap *:px-3 *:py-2.5 *:text-center *:text-[12px] *:select-none"
                    >
                      <td onClick={() => setSelectedOrder(order)} className="cursor-pointer">
                        <OrderImages orderItems={order.orderItems} />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          title={`View details for order ${order._id}`}
                          className="font-mono uppercase text-[10px] text-blue-600 hover:text-blue-800 underline font-semibold cursor-pointer"
                        >
                          {order._id.substring(0, 8)}...
                        </button>
                      </td>
                      <td>{formatLocalDateOnly(order.createdAt)}</td>
                      <td
                        className="max-w-50 truncate"
                        title={`${order.shippingAddress.street}, ${order.shippingAddress.area}, ${order.shippingAddress.city}`}
                      >{`${order.shippingAddress.city}, ${order.shippingAddress.area}`}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          {order.orderItems.length}
                        </button>
                      </td>
                      <td className="font-bold text-primary">{formatCurrency(order.totalPrice)}</td>
                      <td>
                        <SelectStatus id={order._id} status={order.status} />
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Invoice */}
                          <button
                            type="button"
                            onClick={() => setInvoiceOrder(order)}
                            title="Generate Invoice"
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded transition-colors cursor-pointer"
                          >
                            <FaFileInvoice size={14} />
                          </button>
                          {/* Shipping Label */}
                          <button
                            type="button"
                            onClick={() => setShippingLabelOrder(order)}
                            title="Print Shipping Label"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded transition-colors cursor-pointer"
                          >
                            <FaShippingFast size={14} />
                          </button>
                          {/* Tracking Message */}
                          <button
                            type="button"
                            onClick={() => setTrackingMsgOrder(order)}
                            title="Generate Shipment Tracking Message"
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded transition-colors cursor-pointer"
                          >
                            <FaTruck size={14} />
                          </button>
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            title="View Order Details"
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded transition-colors cursor-pointer"
                          >
                            <FaEye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 font-jetbrains">
                      No orders found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onGenerateInvoice={(order) => {
          setSelectedOrder(null);
          setInvoiceOrder(order);
        }}
        onPrintShippingLabel={(order) => {
          setSelectedOrder(null);
          setShippingLabelOrder(order);
        }}
        onGenerateTrackingMsg={(order) => {
          setSelectedOrder(null);
          setTrackingMsgOrder(order);
        }}
      />

      {/* 1) Invoice Modal */}
      <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />

      {/* 2) Shipping Label Modal */}
      <ShippingLabelModal order={shippingLabelOrder} onClose={() => setShippingLabelOrder(null)} />

      {/* 3) Shipment Tracking Message Modal */}
      <ShipmentTrackingModal order={trackingMsgOrder} onClose={() => setTrackingMsgOrder(null)} />
    </div>
  );
};

export default Orders;
