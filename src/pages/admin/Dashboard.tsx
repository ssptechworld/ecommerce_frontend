// --- Libraries
import { useEffect, useState } from "react";

// --- React Icons
import { FiUsers } from "react-icons/fi";
import { SiSoundcharts } from "react-icons/si";
import { BiBasket } from "react-icons/bi";
import { TbCategory2 } from "react-icons/tb";
import { FaDollarSign } from "react-icons/fa6";

// --- Utils
import { formatCurrency } from "@utils/formatCurrency";
import { formatLocalDateOnly } from "@utils/formatLocalDate";
import { cn } from "@utils/cn";

// --- Types
import type { OrderType } from "@/types/types";

// --- RTK
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { fetchAllOrders } from "@features/orders/ordersSlice";
import { fetchDashboardStats, clearStats } from "@features/statistics/statisticsSlice";

// --- Local Components
import SelectStatus from "@pages/admin/SelectStatus";
import OrderImages from "@pages/admin/OrderImages";
import OrderDetailsModal from "@pages/admin/OrderDetailsModal";

// --- CustomStatsCard
type CustomStatsCardProps = React.ComponentProps<"div"> & {
  firstIcon: React.ReactNode;
  secondIcon: React.ReactNode;
  title: string;
  stats: number;
  price?: boolean;
  color: string;
};
const CustomStatsCard = ({
  firstIcon,
  secondIcon,
  title,
  stats,
  price = false,
  color,
  className,
  ...rest
}: CustomStatsCardProps) => {
  return (
    <div
      style={{ background: `linear-gradient(to right, ${color}, ${color}80)` }}
      className={cn(
        `relative px-5 sm:px-7 py-5 min-h-24 rounded-md flex items-center justify-start gap-4 sm:gap-6 shadow-lg min-w-0`,
        className,
      )}
      {...rest}
    >
      <div className="text-white/50 shrink-0">{firstIcon}</div>
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center font-jetbrains text-center">
        <span className="text-white/75 tracking-wider font-bold text-sm sm:text-base truncate max-w-full">{title}</span>
        <span className="text-xl sm:text-[22px] xxl:text-[20px] font-semibold flex items-center justify-center">
          {price ? formatCurrency(stats) : stats.toLocaleString()}
        </span>
      </div>
      <div className="absolute top-2.5 right-2.5 text-white/45">{secondIcon}</div>
    </div>
  );
};

// --- Main Component
const Dashboard = () => {
  // statistics slice
  const { stats } = useAppSelector((state) => state.statistics);
  const { orders } = useAppSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);

  const dispatch = useAppDispatch();

  // --- Fetch Recent Data
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllOrders());

    // (Cleanup)
    return () => {
      dispatch(clearStats());
    };
  }, [dispatch]);

  // --- Return JSX
  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="bg-white p-5 rounded-md shadow-sm mb-5">
        <h1 className="text-xl font-bold text-primary font-jetbrains">Dashboard Overview</h1>
        <p className="text-sm text-gray-500">Real-time analytics from MongoDB Aggregation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xxl:grid-cols-4 gap-4 xxl:gap-2.5 text-white">
        <CustomStatsCard
          firstIcon={<FaDollarSign size={30} />}
          secondIcon={<SiSoundcharts size={30} />}
          title="Total Revenue"
          stats={stats?.totalRevenue || 0}
          price={true}
          color="#3071FB"
        />
        <CustomStatsCard
          firstIcon={<FiUsers size={30} />}
          secondIcon={<SiSoundcharts size={30} />}
          title="Active Users"
          stats={stats?.usersCount || 0}
          color="#00A47D"
        />
        <CustomStatsCard
          firstIcon={<BiBasket size={30} />}
          secondIcon={<SiSoundcharts size={30} />}
          title="Total Orders"
          stats={stats?.ordersCount || 0}
          color="#4A50E7"
        />
        <CustomStatsCard
          firstIcon={<TbCategory2 size={30} />}
          secondIcon={<SiSoundcharts size={30} />}
          title="Total Products"
          stats={stats?.productsCount || 0}
          color="#FF425D"
        />
      </div>

      <h3 className="my-5 text-xl font-jetbrains bg-white p-2.5 w-fit rounded-md shadow-sm">Recent Orders</h3>

      {/* Table Section */}
      <div className="flex-1 bg-white rounded-md shadow-sm flex flex-col">
        <div className="overflow-auto custom-scrollbar flex-1">
          <table className="w-full min-w-max relative border-separate border-spacing-0">
            <thead>
              <tr className="sticky top-0 z-10 bg-[#EFF2F3] shadow-sm text-neutral-700 *:text-[10px] *:px-3 *:py-2.5 *:text-center">
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
              {orders.length > 0 ? (
                orders.slice(0, 7).map((order) => (
                  <tr
                    key={order._id}
                    className="even:bg-[#EFF2F3]/75 hover:bg-gray-500/10 transition-colors *:px-3 *:py-2.5 *:text-center *:text-[12px]"
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
                    <td className="max-w-40 truncate" title={order.shippingAddress.street}>
                      {`${order.shippingAddress.city}, ${order.shippingAddress.area}`}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        {order.orderItems.length}
                      </button>
                    </td>
                    <td>{formatCurrency(order.totalPrice)}</td>
                    <td>
                      <SelectStatus id={order._id} status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500 font-jetbrains text-sm">
                    No recent orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default Dashboard;

