import { Link, useParams } from "react-router-dom";
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">
            <CheckCircle size={64} color="#22c55e" />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>
            Thank you for your order. We have received it and will begin
            processing it right away.
          </p>

          <div className="order-details-box">
            <span className="label">Order Number</span>
            <span className="value">#{orderId}</span>
          </div>

          <p className="delivery-note">
            Estimated delivery time: <strong>30-45 minutes</strong>
          </p>

          <div className="success-actions">
            <Link to="/profile" className="btn btn-primary">
              Track Order <ArrowRight size={18} />
            </Link>
            <Link to="/menu" className="btn btn-outline">
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
