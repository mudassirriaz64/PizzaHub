import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    awaitingPaymentOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    customersChange: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderInfo, setShowOrderInfo] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/reports/dashboard.php");
      if (response.data) {
        setStats(
          response.data.stats || {
            totalRevenue: 0,
            totalOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            pendingOrders: 0,
            inProgressOrders: 0,
            awaitingPaymentOrders: 0,
            totalProducts: 0,
            totalCustomers: 0,
            revenueChange: 0,
            ordersChange: 0,
            productsChange: 0,
            customersChange: 0,
          }
        );
        setSalesData(response.data.salesData || []);
        setTopProducts(response.data.topProducts || []);
        setRecentOrders(response.data.recentOrders || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange}%`,
      isPositive: stats.revenueChange >= 0,
      color: "green",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      change: `${stats.ordersChange >= 0 ? "+" : ""}${stats.ordersChange}%`,
      isPositive: stats.ordersChange >= 0,
      color: "blue",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: Package,
      change: `${stats.productsChange >= 0 ? "+" : ""}${stats.productsChange}%`,
      isPositive: stats.productsChange >= 0,
      color: "orange",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      change: `${stats.customersChange >= 0 ? "+" : ""}${
        stats.customersChange
      }%`,
      isPositive: stats.customersChange >= 0,
      color: "purple",
    },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-title-row">
                <span className="stat-title">{stat.title}</span>
                {stat.title === "Total Orders" && (
                  <div
                    className="info-icon-wrapper"
                    onMouseEnter={() => setShowOrderInfo(true)}
                    onMouseLeave={() => setShowOrderInfo(false)}
                  >
                    <Info size={16} />
                    {showOrderInfo && (
                      <div className="order-tooltip">
                        <div className="tooltip-item">
                          <span className="tooltip-label">Completed:</span>
                          <span className="tooltip-value completed">
                            {stats.completedOrders}
                          </span>
                        </div>
                        <div className="tooltip-item">
                          <span className="tooltip-label">Pending:</span>
                          <span className="tooltip-value pending">
                            {stats.pendingOrders}
                          </span>
                        </div>
                        <div className="tooltip-item">
                          <span className="tooltip-label">In Progress:</span>
                          <span className="tooltip-value progress">
                            {stats.inProgressOrders}
                          </span>
                        </div>
                        <div className="tooltip-item">
                          <span className="tooltip-label">Cancelled:</span>
                          <span className="tooltip-value cancelled">
                            {stats.cancelledOrders}
                          </span>
                        </div>
                        {stats.awaitingPaymentOrders > 0 && (
                          <div className="tooltip-item">
                            <span className="tooltip-label">
                              Awaiting Payment:
                            </span>
                            <span className="tooltip-value awaiting">
                              {stats.awaitingPaymentOrders}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="stat-value">{stat.value}</span>
              <span
                className={`stat-change ${
                  stat.isPositive ? "positive" : "negative"
                }`}
              >
                {stat.isPositive ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card sales-chart">
          <div className="card-header">
            <h2>Sales Overview</h2>
            <span className="card-subtitle">Last 7 days</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#991b1b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#991b1b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    theme === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.1)"
                  }
                />
                <XAxis
                  dataKey="name"
                  stroke={
                    theme === "dark"
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(0,0,0,0.5)"
                  }
                  fontSize={12}
                />
                <YAxis
                  stroke={
                    theme === "dark"
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(0,0,0,0.5)"
                  }
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    background: theme === "dark" ? "#1a1a2e" : "#ffffff",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid #dee2e6",
                    borderRadius: "8px",
                    color: theme === "dark" ? "#fff" : "#212529",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#991b1b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card top-products">
          <div className="card-header">
            <h2>Top Selling Products</h2>
            <span className="card-subtitle">This month</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    theme === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.1)"
                  }
                />
                <XAxis
                  type="number"
                  stroke={
                    theme === "dark"
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(0,0,0,0.5)"
                  }
                  fontSize={12}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke={
                    theme === "dark"
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(0,0,0,0.5)"
                  }
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    background: theme === "dark" ? "#1a1a2e" : "#ffffff",
                    border:
                      theme === "dark"
                        ? "1px solid rgba(255,255,255,0.1)"
                        : "1px solid #dee2e6",
                    borderRadius: "8px",
                    color: theme === "dark" ? "#fff" : "#212529",
                  }}
                />
                <Bar dataKey="sales" fill="#991b1b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="recent-orders-card">
        <div className="card-header">
          <h2>Recent Orders</h2>
          <button
            className="view-all-btn"
            onClick={() => navigate("/admin/orders")}
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={index}>
                  <td className="order-id">{order.id}</td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">{order.customer}</span>
                      <span className="customer-type">
                        {order.isGuest ? "Guest" : "Registered User"}
                      </span>
                    </div>
                  </td>
                  <td className="order-total">Rs. {order.total.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <span className="order-time">
                      <Clock size={14} />
                      {order.time}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
