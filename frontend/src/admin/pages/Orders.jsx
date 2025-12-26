import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Eye,
  ShoppingCart,
  X,
  Printer,
  CreditCard,
  Trash2,
  User,
} from "lucide-react";
import api from "../services/api";
import ReceiptModal from "../components/ReceiptModal";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "online", label: "Online" },
  { value: "instore", label: "In-Store" },
];

const paymentOptions = [
  { value: "", label: "All Payment" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
];

const customerTypeOptions = [
  { value: "", label: "All Customers" },
  { value: "registered", label: "Registered" },
  { value: "guest", label: "Guest" },
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (typeFilter) params.append("type", typeFilter);
      if (paymentFilter) params.append("payment_status", paymentFilter);
      if (dateFilter) params.append("date", dateFilter);
      if (customerTypeFilter)
        params.append("customer_type", customerTypeFilter);

      const response = await api.get(`/orders/index.php?${params}`);
      console.log("Orders response:", response.data);
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, paymentFilter, dateFilter, customerTypeFilter]);

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 10 seconds to detect new orders
    const pollInterval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, newStatus, previousStatus) => {
    setUpdatingOrderId(orderId);

    // Optimistic update so the table changes immediately
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId ? { ...o, status: newStatus } : o
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );
    }

    try {
      const response = await api.post("/orders/update.php", {
        id: orderId,
        status: newStatus,
      });

      if (response.data.success) {
        // Update with server response to stay accurate
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: response.data.order.status,
                }
              : o
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => ({
            ...prev,
            status: response.data.order.status,
          }));
        }

        // Show success message
        setStatusMessage({
          type: "success",
          text: "Order status updated successfully",
        });
        setTimeout(() => setStatusMessage(null), 3000);

        // Re-fetch to stay in sync with backend (revenue, counts, etc.)
        fetchOrders();
      }
    } catch (error) {
      console.error("Failed to update order:", error);

      // Rollback optimistic update
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === orderId ? { ...o, status: previousStatus } : o
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: previousStatus }));
      }

      // Show error message
      setStatusMessage({
        type: "error",
        text: "Failed to update order status",
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const confirmPayment = async (orderId) => {
    setUpdatingOrderId(orderId);

    // Optimistic update for immediate UI feedback
    const previousOrders = [...orders];
    const previousSelectedOrder = selectedOrder ? { ...selectedOrder } : null;

    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId
          ? { ...o, paymentStatus: "paid", status: "completed" }
          : o
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => ({
        ...prev,
        paymentStatus: "paid",
        status: "completed",
      }));
    }

    try {
      const response = await api.post("/orders/update.php", {
        id: orderId,
        paymentStatus: "paid",
      });

      if (response.data.success) {
        // Update order with new status (auto-completed) and payment status
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  paymentStatus: "paid",
                  status: response.data.order.status,
                }
              : o
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => ({
            ...prev,
            paymentStatus: "paid",
            status: response.data.order.status,
          }));
        }

        setStatusMessage({
          type: "success",
          text: "Payment confirmed! Order marked as completed.",
        });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      // Rollback optimistic update
      setOrders(previousOrders);
      if (previousSelectedOrder) {
        setSelectedOrder(previousSelectedOrder);
      }
      setStatusMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to confirm payment",
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const deleteOrder = async (orderId, orderNumber) => {
    if (
      !window.confirm(
        `Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setUpdatingOrderId(orderId);

    // Optimistic update - remove from list
    const previousOrders = [...orders];
    setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId));

    // Close modal if viewing this order
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(null);
    }

    try {
      const response = await api.post("/orders/delete.php", { id: orderId });

      if (response.data.success) {
        setStatusMessage({
          type: "success",
          text: "Order deleted successfully",
        });
        setTimeout(() => setStatusMessage(null), 3000);
      } else {
        // Rollback
        setOrders(previousOrders);
        setStatusMessage({
          type: "error",
          text: response.data.error || "Failed to delete order",
        });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (error) {
      console.error("Failed to delete order:", error);
      // Rollback
      setOrders(previousOrders);
      setStatusMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to delete order",
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="orders-page">
      {/* Status Message Toast */}
      {statusMessage && (
        <div className={`status-toast status-toast-${statusMessage.type}`}>
          {statusMessage.text}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p>View and manage all orders</p>
        </div>
      </div>

      <div className="orders-toolbar">
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <ShoppingCart size={18} />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <Clock size={18} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="payment-filter"
          >
            {paymentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <User size={18} />
          <select
            value={customerTypeFilter}
            onChange={(e) => setCustomerTypeFilter(e.target.value)}
          >
            {customerTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="orders-count">{orders.length} orders</div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={48} />
          <h3>No orders found</h3>
          <p>Orders will appear here once created from POS or online.</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.orderNumber}</td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">
                        {order.customerName}
                      </span>
                      <span
                        className={`customer-type ${
                          order.isGuest ? "guest" : "registered"
                        }`}
                      >
                        {order.isGuest ? "Guest" : "Registered"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge type-${order.orderType}`}>
                      {order.orderType === "instore" ? "In-Store" : "Online"}
                    </span>
                  </td>
                  <td>{order.items?.length || 0} items</td>
                  <td className="order-total">Rs. {order.total.toFixed(2)}</td>
                  <td>
                    <select
                      className={`status-select status-${order.status} ${
                        updatingOrderId === order.id ? "updating" : ""
                      }`}
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(
                          order.id,
                          e.target.value,
                          order.status
                        )
                      }
                      disabled={updatingOrderId === order.id}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option
                        value="completed"
                        disabled={order.paymentStatus === "pending"}
                      >
                        Completed{" "}
                        {order.paymentStatus === "pending"
                          ? "(Confirm Payment First)"
                          : ""}
                      </option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className={`payment-badge payment-${order.paymentStatus}`}
                    >
                      {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="order-date">{formatDate(order.createdAt)}</td>
                  <td className="order-actions">
                    <div className="actions-wrapper">
                      <button
                        className="view-btn"
                        onClick={() => setSelectedOrder(order)}
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      {order.paymentStatus === "pending" &&
                        order.status !== "cancelled" && (
                          <button
                            className="payment-btn"
                            onClick={() => confirmPayment(order.id)}
                            title="Confirm Payment"
                            disabled={updatingOrderId === order.id}
                          >
                            <CreditCard size={18} />
                          </button>
                        )}
                      <button
                        className="delete-btn"
                        onClick={() => deleteOrder(order.id, order.orderNumber)}
                        title="Delete Order"
                        disabled={updatingOrderId === order.id}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order {selectedOrder.orderNumber}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="order-details">
              <div className="detail-section">
                <h4>Customer</h4>
                <p>
                  {selectedOrder.customerName}
                  <span
                    className={`customer-type ${
                      selectedOrder.isGuest ? "guest" : "registered"
                    }`}
                    style={{ marginLeft: "8px" }}
                  >
                    {selectedOrder.isGuest ? "Guest" : "Registered"}
                  </span>
                </p>
                <p>{selectedOrder.customerPhone}</p>
              </div>
              <div className="detail-section">
                <h4>Order Info</h4>
                <p>
                  <strong>Invoice:</strong> {selectedOrder.invoiceNumber}
                </p>
                <p>
                  <strong>Type:</strong>{" "}
                  {selectedOrder.orderType === "instore"
                    ? "In-Store"
                    : "Online"}
                </p>
                <p>
                  <strong>Payment:</strong> {selectedOrder.paymentMethod}{" "}
                  <span
                    className={`payment-badge payment-${selectedOrder.paymentStatus}`}
                  >
                    {selectedOrder.paymentStatus === "paid"
                      ? "Paid"
                      : "Pending"}
                  </span>
                </p>
                {selectedOrder.paymentStatus === "pending" &&
                  selectedOrder.status !== "cancelled" && (
                    <button
                      className="btn btn-primary"
                      onClick={() => confirmPayment(selectedOrder.id)}
                      disabled={updatingOrderId === selectedOrder.id}
                      style={{ marginTop: "8px" }}
                    >
                      <CreditCard size={16} />
                      {updatingOrderId === selectedOrder.id
                        ? "Confirming..."
                        : "Confirm Payment"}
                    </button>
                  )}
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge status-${selectedOrder.status}`}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
              </div>
              <div className="detail-section items-section">
                <h4>Items</h4>
                <div className="order-items-list">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <span className="item-name">{item.productName}</span>
                      <span className="item-qty">x{item.quantity}</span>
                      <span className="item-price">
                        Rs. {parseFloat(item.subtotal).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>Rs. {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="total-row discount">
                    <span>Discount</span>
                    <span>-Rs. {selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-row">
                  <span>Tax</span>
                  <span>Rs. {selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>Rs. {selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
              <div
                className="order-actions-footer"
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReceiptModal(true)}
                >
                  <Printer size={18} style={{ marginRight: "8px" }} /> Print
                  Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          onClose={() => {
            setShowReceiptModal(false);
            setSelectedOrder(null);
          }}
          showHeader={false}
        />
      )}
    </div>
  );
}

export default Orders;
