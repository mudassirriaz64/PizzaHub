import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  BarChart3,
  FileDown,
  FileSpreadsheet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../services/api";

const COLORS = ["#e94560", "#3b82f6", "#22c55e", "#f97316", "#a855f7"];

function Reports() {
  const [period, setPeriod] = useState("weekly");
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [period]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/reports/sales.php?period=${period}`;
      if (period === "custom" && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }
      const response = await api.get(url);
      if (response.data.success) {
        setReport(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      let url = `/reports/sales.php?period=${period}&export=pdf`;
      if (period === "custom" && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      // Use the same base URL as the API service
      const baseURL =
        import.meta.env.VITE_API_URL ||
        "http://localhost/PizzaHub/backend/admin";
      const fullUrl = `${baseURL}${url}`;
      window.open(fullUrl, "_blank");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("Failed to export PDF report");
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      let url = `/reports/sales.php?period=${period}&export=excel`;
      if (period === "custom" && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }
      const response = await api.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], {
        type: "application/vnd.ms-excel",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `sales-report-${period}-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();
    } catch (error) {
      console.error("Failed to export Excel:", error);
      alert("Failed to export Excel report");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (value) => `Rs. ${value.toFixed(2)}`;

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h1>Sales Reports</h1>
          <p>View sales analytics and performance</p>
        </div>
        <div className="header-actions">
          <div className="period-selector">
            <button
              className={period === "daily" ? "active" : ""}
              onClick={() => setPeriod("daily")}
            >
              Today
            </button>
            <button
              className={period === "weekly" ? "active" : ""}
              onClick={() => setPeriod("weekly")}
            >
              Last 7 Days
            </button>
            <button
              className={period === "monthly" ? "active" : ""}
              onClick={() => setPeriod("monthly")}
            >
              This Month
            </button>
            <button
              className={period === "custom" ? "active" : ""}
              onClick={() => setPeriod("custom")}
            >
              Custom Range
            </button>
          </div>
          <div className="export-buttons">
            <button
              className="btn-export"
              onClick={exportToPDF}
              disabled={exporting || !report}
            >
              <FileDown size={18} />
              Export PDF
            </button>
            <button
              className="btn-export excel"
              onClick={exportToExcel}
              disabled={exporting || !report}
            >
              <FileSpreadsheet size={18} />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {period === "custom" && (
        <div className="date-range-picker">
          <div className="date-input-group">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="date-input-group">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={fetchReport}
            disabled={!startDate || !endDate}
          >
            Generate Report
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading report...</p>
        </div>
      ) : report ? (
        <>
          {report.summary.totalOrders === 0 && (
            <div
              className="alert alert-info"
              style={{
                background: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Package size={20} style={{ color: "#3b82f6" }} />
              <div>
                <strong>No orders found for this period</strong>
                <p
                  style={{ margin: "5px 0 0", fontSize: "14px", opacity: 0.8 }}
                >
                  Try selecting a different period or{" "}
                  <a
                    href="/admin/pos"
                    style={{ color: "#3b82f6", textDecoration: "underline" }}
                  >
                    create test orders
                  </a>{" "}
                  to see data here.
                </p>
              </div>
            </div>
          )}
          <div className="report-summary">
            <div className="summary-card">
              <div className="summary-icon revenue">
                <DollarSign size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-label">Total Revenue</span>
                <span className="summary-value">
                  {formatCurrency(report.summary.totalRevenue)}
                </span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon orders">
                <ShoppingCart size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-label">Completed Orders</span>
                <span className="summary-value">
                  {report.summary.totalOrders}
                </span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon avg">
                <TrendingUp size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-label">Avg Order Value</span>
                <span className="summary-value">
                  {formatCurrency(report.summary.averageOrderValue)}
                </span>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon discounts">
                <Calendar size={24} />
              </div>
              <div className="summary-content">
                <span className="summary-label">Date Range</span>
                <span className="summary-value date">
                  {report.dateRange.start} - {report.dateRange.end}
                </span>
              </div>
            </div>
          </div>

          <div className="report-grid">
            <div className="report-card sales-chart">
              <h3>
                <BarChart3 size={18} />
                Revenue Trend
              </h3>
              <div className="chart-container">
                {report.dailySales.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={report.dailySales}>
                      <defs>
                        <linearGradient
                          id="revenueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#e94560"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#e94560"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.4)"
                        fontSize={11}
                        tickFormatter={(date) =>
                          new Date(date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "#1a1a2e",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value) => [
                          formatCurrency(value),
                          "Revenue",
                        ]}
                        labelFormatter={(date) =>
                          new Date(date).toLocaleDateString()
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#e94560"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">No sales data available</div>
                )}
              </div>
            </div>

            <div className="report-card category-breakdown">
              <h3>
                <Package size={18} />
                Sales by Category
              </h3>
              <div className="chart-container">
                {report.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={report.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="revenue"
                        nameKey="category"
                        label={({ category, percent }) =>
                          `${category} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {report.categoryBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#1a1a2e",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                        formatter={(value) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">No category data available</div>
                )}
              </div>
            </div>
          </div>

          <div className="report-card top-products">
            <h3>
              <TrendingUp size={18} />
              Top Selling Products
            </h3>
            {report.topProducts.length > 0 ? (
              <div className="top-products-list">
                {report.topProducts.map((product, index) => (
                  <div key={index} className="top-product-item">
                    <span className="rank">#{index + 1}</span>
                    <span className="product-name">{product.name}</span>
                    <span className="quantity">
                      {product.quantitySold} sold
                    </span>
                    <span className="revenue">
                      {formatCurrency(product.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No product data available</div>
            )}
          </div>

          <div className="order-breakdown">
            <div className="breakdown-card">
              <h4>Online Orders</h4>
              <span className="breakdown-value">
                {report.summary.onlineOrders}
              </span>
            </div>
            <div className="breakdown-card">
              <h4>In-Store Orders</h4>
              <span className="breakdown-value">
                {report.summary.instoreOrders}
              </span>
            </div>
            <div className="breakdown-card">
              <h4>Total Discounts</h4>
              <span className="breakdown-value discount">
                {formatCurrency(report.summary.totalDiscounts)}
              </span>
            </div>
            <div className="breakdown-card">
              <h4>Total Tax Collected</h4>
              <span className="breakdown-value">
                {formatCurrency(report.summary.totalTax)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <BarChart3 size={48} />
          <h3>No report data</h3>
          <p>Sales reports will appear here once orders are created.</p>
          <div
            className="empty-state-actions"
            style={{
              marginTop: "20px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <button
              className="btn btn-primary"
              onClick={() => (window.location.href = "/admin/pos")}
              style={{ padding: "10px 20px" }}
            >
              Create Order via POS
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setPeriod("custom")}
              style={{ padding: "10px 20px", background: "#3b82f6" }}
            >
              Try Custom Date Range
            </button>
          </div>
          <p style={{ marginTop: "15px", fontSize: "14px", color: "#888" }}>
            Tip: You can also create sample data by running{" "}
            <code>database/create_sample_orders.sql</code> in phpMyAdmin
          </p>
        </div>
      )}
    </div>
  );
}

export default Reports;
