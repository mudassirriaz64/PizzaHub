import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { MapPin, Phone, User, CreditCard, ArrowRight } from "lucide-react";
import OrderSuccessModal from "../components/OrderSuccessModal";

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOrderId, setSuccessOrderId] = useState(null);

  useEffect(() => {
    // Don't redirect if showing success modal
    if (cartItems.length === 0 && !successOrderId) {
      navigate("/menu");
    }
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      }));
    }
  }, [cartItems, user, navigate, successOrderId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    const deliveryFee = cartTotal > 1000 ? 0 : 150;
    return cartTotal + deliveryFee;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost/PizzaHub/backend/customer/orders/create.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            items: cartItems,
            customer_name: formData.name,
            delivery_address: formData.address,
            payment_method: formData.paymentMethod,
          }),
        }
      );

      const data = await response.json();
      console.log("Order response:", data);

      if (data.success) {
        clearCart();
        setSuccessOrderId(data.orderId); // Show success modal instead of navigating
      } else {
        setError(data.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>Checkout</h2>
          <p>Complete your order</p>
        </div>

        <div className="checkout-grid">
          {/* Form Section */}
          <div className="checkout-form-section">
            <div className="section-card">
              <h3>Delivery Details</h3>
              {error && <div className="error-banner">{error}</div>}

              <form id="checkout-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="0300 1234567"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Delivery Address</label>
                  <div className="input-with-icon">
                    <MapPin size={18} />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Complete address for delivery"
                      rows="3"
                    ></textarea>
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-options">
                    <label
                      className={`payment-option ${
                        formData.paymentMethod === "cod" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === "cod"}
                        onChange={handleChange}
                      />
                      <span className="payment-icon">💵</span>
                      <span>Cash on Delivery</span>
                    </label>
                    <label
                      className={`payment-option ${
                        formData.paymentMethod === "card" ? "selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === "card"}
                        onChange={handleChange}
                        disabled
                      />
                      <span className="payment-icon">💳</span>
                      <span>Card (Coming Soon)</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="checkout-summary-section">
            <div className="section-card summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="summary-item">
                    <div className="summary-item-info">
                      <span className="summary-item-qty">{item.quantity}x</span>
                      <span className="summary-item-name">
                        {item.name} {item.size && `(${item.size})`}
                      </span>
                    </div>
                    <span className="summary-item-price">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee</span>
                  <span>{cartTotal > 1000 ? "Free" : "Rs. 150"}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>Rs. {calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                className="btn btn-primary btn-block place-order-btn"
                disabled={loading}
              >
                {loading ? "Placing Order..." : "Place Order"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successOrderId && <OrderSuccessModal orderId={successOrderId} />}
    </div>
  );
}

export default Checkout;
