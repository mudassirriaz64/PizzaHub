import { useEffect } from "react";
import { X, Printer, CheckCircle } from "lucide-react";

function ReceiptModal({ order, onClose, showHeader = true }) {
  useEffect(() => {
    if (order) {
      // Set document title for PDF filename
      const originalTitle = document.title;
      const date = new Date();
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = date.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS
      document.title = `Invoice_${order.invoiceNumber}_${dateStr}_${timeStr}`;

      // Restore original title when component unmounts
      return () => {
        document.title = originalTitle;
      };
    }
  }, [order]);

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        {showHeader && (
          <div className="modal-header no-print">
            <div className="header-title">
              <CheckCircle className="success-icon" size={24} />
              <h2>Order Completed!</h2>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        )}

        <div className="receipt-content" id="printable-receipt">
          <div className="receipt-header">
            <h1>PizzaHub</h1>
            <p className="store-address">123 Pizza Street, Food City</p>
            <p className="store-phone">+92 300 1234567</p>
            <div className="receipt-divider"></div>
            <div className="order-meta">
              <div className="meta-row">
                <span>Order #</span>
                <span>{order.orderNumber}</span>
              </div>
              <div className="meta-row">
                <span>Invoice #</span>
                <span>{order.invoiceNumber}</span>
              </div>
              <div className="meta-row">
                <span>Date</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div className="meta-row">
                <span>Customer</span>
                <span>
                  {order.customerName || "Guest"}
                  {order.customerType && (
                    <span className="customer-type">
                      {order.customerType === "registered"
                        ? " (Registered)"
                        : " (Walk-in)"}
                    </span>
                  )}
                </span>
              </div>
              <div className="meta-row">
                <span>Payment</span>
                <span>
                  {order.paymentMethod === "cash" ||
                  order.paymentMethod === "cod"
                    ? "Cash"
                    : order.paymentMethod === "card"
                    ? "Card"
                    : order.paymentMethod || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-items">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items &&
                  order.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        {item.productName || item.name}
                        {item.sizeName && (
                          <span className="item-size"> ({item.sizeName})</span>
                        )}
                      </td>
                      <td>{item.quantity}</td>
                      <td>Rs. {item.price}</td>
                      <td>Rs. {item.price * item.quantity}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Rs. {Math.round(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="summary-row">
                <span>Discount</span>
                <span>-Rs. {Math.round(order.discount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Tax</span>
              <span>Rs. {Math.round(order.tax)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>Rs. {Math.round(order.total)}</span>
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-footer">
            <p>Thank you for your order!</p>
            <p>Please come again</p>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={18} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReceiptModal;
