import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Printer,
  Edit,
  Lock,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";

function Profile() {
  const { user, logout, loading: authLoading, setUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Profile edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState({ type: "", text: "" });

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) {
      return;
    }

    // Only redirect if auth is done loading AND no user
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // User is logged in, fetch orders
    fetchOrders();

    // Auto-refresh orders every 30 seconds for real-time status updates
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        "http://localhost/PizzaHub/backend/customer/orders/index.php",
        {
          credentials: "include", // Important for session cookies
        }
      );
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    setModalLoading(true);
    setSelectedOrder({ id: orderId }); // Show modal with loading state

    try {
      const response = await fetch(
        `http://localhost/PizzaHub/backend/customer/orders/view.php?id=${orderId}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.order);
      }
    } catch (err) {
      console.error("Failed to fetch details", err);
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Format order number as ORD-001
  const formatOrderNumber = (id) => {
    return `ORD-${String(id).padStart(3, "0")}`;
  };

  // Open edit profile modal
  const openEditModal = () => {
    setEditForm({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    });
    setEditMessage({ type: "", text: "" });
    setShowEditModal(true);
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        "http://localhost/PizzaHub/backend/customer/auth/update-profile.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(editForm),
        }
      );
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setEditMessage({
          type: "success",
          text: "Profile updated successfully!",
        });
        setTimeout(() => setShowEditModal(false), 1500);
      } else {
        setEditMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setEditMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setEditLoading(false);
    }
  };

  // Open password change modal
  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordMessage({ type: "", text: "" });
    setShowPasswords({ current: false, new: false, confirm: false });
    setShowPasswordModal(true);
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      const response = await fetch(
        "http://localhost/PizzaHub/backend/customer/auth/change-password.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(passwordForm),
        }
      );
      const data = await response.json();

      if (data.success) {
        setPasswordMessage({
          type: "success",
          text: "Password changed successfully!",
        });
        setTimeout(() => setShowPasswordModal(false), 1500);
      } else {
        setPasswordMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setPasswordMessage({ type: "error", text: "Failed to change password" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const printInvoice = () => {
    if (!selectedOrder) return;

    // Calculate delivery fee (same logic as checkout)
    const deliveryFee = Number(selectedOrder.subtotal) > 1000 ? 0 : 150;
    const tax = Number(selectedOrder.tax) || 0;
    const discount = Number(selectedOrder.discount) || 0;

    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - Order #${selectedOrder.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 650px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e94560; padding-bottom: 20px; }
          .header h1 { color: #e94560; margin: 0; font-size: 28px; }
          .header p { color: #666; margin: 5px 0; }
          .section { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .section h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; text-transform: uppercase; }
          .section p { margin: 5px 0; font-size: 14px; }
          .two-col { display: flex; gap: 20px; }
          .two-col > div { flex: 1; }
          .items { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          .items th { background: #e94560; color: white; padding: 12px 10px; text-align: left; font-size: 13px; }
          .items td { border-bottom: 1px solid #ddd; padding: 12px 10px; font-size: 14px; }
          .items .qty { text-align: center; width: 60px; }
          .items .price { text-align: right; }
          .totals { background: #f9f9f9; padding: 15px; border-radius: 8px; }
          .totals .row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .totals .row.discount { color: #22c55e; }
          .totals .row.total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🍕 PizzaHub</h1>
          <p>Tax Invoice / Receipt</p>
        </div>
        
        <div class="two-col">
          <div class="section">
            <h3>Order Details</h3>
            <p><strong>Invoice #:</strong> INV-${String(
              selectedOrder.id
            ).padStart(5, "0")}</p>
            <p><strong>Order #:</strong> ORD-${String(
              selectedOrder.id
            ).padStart(3, "0")}</p>
            <p><strong>Date:</strong> ${new Date(
              selectedOrder.created_at
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p><strong>Time:</strong> ${new Date(
              selectedOrder.created_at
            ).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><strong>Status:</strong> ${selectedOrder.status
              .replace("_", " ")
              .toUpperCase()}</p>
            <p><strong>Payment:</strong> ${
              selectedOrder.payment_status?.toUpperCase() || "PENDING"
            }</p>
          </div>
          
          <div class="section">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${user?.name || "Customer"}</p>
            <p><strong>Phone:</strong> ${user?.phone || "-"}</p>
            <p><strong>Email:</strong> ${user?.email || "-"}</p>
            ${
              selectedOrder.delivery_address
                ? `<p><strong>Address:</strong> ${selectedOrder.delivery_address}</p>`
                : ""
            }
          </div>
        </div>
        
        <table class="items">
          <thead>
            <tr>
              <th>Item Description</th>
              <th class="qty">Qty</th>
              <th class="price">Unit Price</th>
              <th class="price">Total</th>
            </tr>
          </thead>
          <tbody>
            ${selectedOrder.items
              ?.map(
                (item) => `
              <tr>
                <td>${item.product_name}${
                  item.size_name ? ` <small>(${item.size_name})</small>` : ""
                }</td>
                <td class="qty">${item.quantity}</td>
                <td class="price">Rs. ${Number(
                  item.price
                ).toLocaleString()}</td>
                <td class="price">Rs. ${Number(
                  item.price * item.quantity
                ).toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="totals">
          <div class="row"><span>Subtotal</span><span>Rs. ${Number(
            selectedOrder.subtotal
          ).toLocaleString()}</span></div>
          ${
            tax > 0
              ? `<div class="row"><span>Tax</span><span>Rs. ${tax.toLocaleString()}</span></div>`
              : ""
          }
          <div class="row"><span>Delivery Fee</span><span>${
            deliveryFee > 0 ? "Rs. " + deliveryFee : "FREE"
          }</span></div>
          ${
            discount > 0
              ? `<div class="row discount"><span>Discount</span><span>-Rs. ${discount.toLocaleString()}</span></div>`
              : ""
          }
          <div class="row total"><span>Grand Total</span><span>Rs. ${Number(
            selectedOrder.total
          ).toLocaleString()}</span></div>
        </div>
        
        <div class="footer">
          <p><strong>Thank you for ordering from PizzaHub!</strong></p>
          <p>For queries, contact us at support@pizzahub.com | +92 300 1234567</p>
          <p style="margin-top: 10px; font-size: 10px;">This is a computer-generated invoice and does not require a signature.</p>
        </div>
        
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  if (authLoading || (!user && loading))
    return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* User Info Card */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-placeholder">{user?.name?.charAt(0)}</div>
              <h3>{user?.name}</h3>
              <p className="member-since">
                Member since{" "}
                {new Date(user?.created_at || Date.now()).getFullYear()}
              </p>
            </div>

            <div className="profile-info-list">
              <div className="info-item">
                <Mail size={18} />
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <Phone size={18} />
                <span>{user?.phone || "No phone added"}</span>
              </div>
              <div className="info-item">
                <MapPin size={18} />
                <span>{user?.address || "No address added"}</span>
              </div>
            </div>

            <div
              className="profile-actions"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "16px",
              }}
            >
              <button
                onClick={openEditModal}
                className="btn btn-primary btn-block"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Edit size={16} />
                Edit Profile
              </button>
              <button
                onClick={openPasswordModal}
                className="btn btn-outline btn-block"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Lock size={16} />
                Change Password
              </button>
              <button
                onClick={logout}
                className="btn btn-outline btn-block"
                style={{ marginTop: "8px" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="profile-content">
          <h2 className="section-title">Order History</h2>

          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <Package size={48} className="text-gray-300" />
              <h3>No orders yet</h3>
              <p>Looks like you haven't placed any orders yet.</p>
              <Link to="/menu" className="btn btn-primary mt-4">
                Browse Menu
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="order-card-row"
                  onClick={() => handleViewOrder(order.id)}
                >
                  <div className="order-row-main">
                    <div className="order-icon">
                      <Package size={24} />
                    </div>
                    <div className="order-info">
                      <h4>{formatOrderNumber(order.id)}</h4>
                      <span className="order-date">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="order-row-meta">
                    <span
                      className={`status-badge ${getStatusColor(order.status)}`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                    <span className="order-total">
                      Rs. {Number(order.total).toLocaleString()}
                    </span>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div
            className="modal-content order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{formatOrderNumber(selectedOrder.id)}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                <X size={20} />
              </button>
            </div>

            {modalLoading || !selectedOrder.items ? (
              <div className="p-8 text-center">Loading details...</div>
            ) : (
              <div className="modal-body">
                <div className="order-status-bar">
                  <div className="status-step active">
                    <div className="step-icon">
                      <CheckCircle size={16} />
                    </div>
                    <span>Placed</span>
                  </div>
                  <div
                    className={`status-step ${
                      selectedOrder.status !== "pending" ? "active" : ""
                    }`}
                  >
                    <div className="step-icon">
                      {selectedOrder.status === "pending" ? (
                        <Clock size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                    </div>
                    <span>
                      {selectedOrder.status === "in_progress"
                        ? "Preparing"
                        : "Processing"}
                    </span>
                  </div>
                  <div
                    className={`status-step ${
                      selectedOrder.status === "completed" ? "active" : ""
                    }`}
                  >
                    <div className="step-icon">
                      <Package size={16} />
                    </div>
                    <span>Completed</span>
                  </div>
                </div>

                <div className="order-items-list">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <span className="qty">{item.quantity}x</span>
                      <div className="details">
                        <span className="name">{item.product_name}</span>
                        {item.size_name && (
                          <span className="size">{item.size_name}</span>
                        )}
                      </div>
                      <span className="price">
                        Rs.{" "}
                        {Number(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="order-summary-footer">
                  <div className="row">
                    <span>Subtotal</span>
                    <span>
                      Rs. {Number(selectedOrder.subtotal).toLocaleString()}
                    </span>
                  </div>
                  <div className="row total">
                    <span>Total</span>
                    <span>
                      Rs. {Number(selectedOrder.total).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="delivery-info-box">
                  <h5>Delivery Address</h5>
                  <p>{selectedOrder.delivery_address}</p>
                </div>

                <div
                  className="modal-footer-actions"
                  style={{ marginTop: "20px", textAlign: "center" }}
                >
                  <button
                    className="btn btn-primary"
                    onClick={printInvoice}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Printer size={18} />
                    Print Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "450px" }}
          >
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleProfileUpdate}
              className="modal-body"
              style={{ padding: "20px" }}
            >
              {editMessage.text && (
                <div
                  className={`alert ${
                    editMessage.type === "success"
                      ? "alert-success"
                      : "alert-error"
                  }`}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    background:
                      editMessage.type === "success"
                        ? "rgba(34, 197, 94, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                    color:
                      editMessage.type === "success" ? "#22c55e" : "#ef4444",
                  }}
                >
                  {editMessage.text}
                </div>
              )}
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                  }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    backgroundColor: "#fff",
                    color: "#333",
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                  }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    backgroundColor: "#fff",
                    color: "#333",
                  }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                  }}
                >
                  Address
                </label>
                <textarea
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    resize: "vertical",
                    backgroundColor: "#fff",
                    color: "#333",
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={editLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Save size={16} />
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "450px" }}
          >
            <div className="modal-header">
              <h3>Change Password</h3>
              <button
                className="close-btn"
                onClick={() => setShowPasswordModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handlePasswordChange}
              className="modal-body"
              style={{ padding: "20px" }}
            >
              {passwordMessage.text && (
                <div
                  className={`alert ${
                    passwordMessage.type === "success"
                      ? "alert-success"
                      : "alert-error"
                  }`}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    background:
                      passwordMessage.type === "success"
                        ? "rgba(34, 197, 94, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                    color:
                      passwordMessage.type === "success"
                        ? "#22c55e"
                        : "#ef4444",
                  }}
                >
                  {passwordMessage.text}
                </div>
              )}
              <div
                className="form-group"
                style={{ marginBottom: "16px", position: "relative" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                  }}
                >
                  Current Password *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      paddingRight: "40px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      backgroundColor: "#fff",
                      color: "#333",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#666",
                    }}
                  >
                    {showPasswords.current ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div
                className="form-group"
                style={{ marginBottom: "16px", position: "relative" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                  }}
                >
                  New Password *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    style={{
                      width: "100%",
                      padding: "12px",
                      paddingRight: "40px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      backgroundColor: "#fff",
                      color: "#333",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#666",
                    }}
                  >
                    {showPasswords.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div
                className="form-group"
                style={{ marginBottom: "16px", position: "relative" }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "#666",
                  }}
                >
                  Confirm New Password *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    style={{
                      width: "100%",
                      padding: "12px",
                      paddingRight: "40px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      backgroundColor: "#fff",
                      color: "#333",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#666",
                    }}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={passwordLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Lock size={16} />
                {passwordLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
