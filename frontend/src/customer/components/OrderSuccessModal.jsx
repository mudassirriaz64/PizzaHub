import { useNavigate } from "react-router-dom";
import { CheckCircle, Package, X } from "lucide-react";

function OrderSuccessModal({ orderId, onClose }) {
  const navigate = useNavigate();

  const handleTrackOrder = () => {
    navigate("/profile");
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    navigate("/");
  };

  return (
    <div className="success-modal-overlay">
      <div className="success-modal">
        <button className="modal-close-btn" onClick={handleClose}>
          <X size={20} />
        </button>

        <div className="success-icon">
          <CheckCircle size={64} />
        </div>

        <h2>Order Placed Successfully!</h2>
        <p className="order-id">
          Order #<strong>ORD-{String(orderId).padStart(3, "0")}</strong>
        </p>
        <p className="success-message">
          Thank you for your order. Your delicious food is being prepared!
        </p>

        <div className="modal-actions">
          <button
            className="btn btn-primary track-btn"
            onClick={handleTrackOrder}
          >
            <Package size={18} />
            Track Order Status
          </button>
          <button className="btn btn-outline" onClick={handleClose}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessModal;
