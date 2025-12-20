import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.05; // 5% tax
  const deliveryFee = subtotal > 1000 ? 0 : 100;
  const total = subtotal + tax + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="section-container">
          <div className="cart-empty">
            <ShoppingBag size={80} />
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added any items yet.</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-items">
          <div className="cart-header">
            <h2>Shopping Cart ({cartItems.length} items)</h2>
          </div>

          {cartItems.map((item, index) => (
            <div key={`${item.id}-${item.size}-${index}`} className="cart-item">
              <div className="cart-item-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="placeholder-image">🍕</div>
                )}
              </div>
              <div className="cart-item-details">
                <h4 className="cart-item-title">{item.name}</h4>
                {item.size && (
                  <p className="cart-item-variant">Size: {item.size}</p>
                )}
                <div className="cart-item-actions">
                  <div className="quantity-selector">
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity - 1)
                      }
                    >
                      <Minus size={16} />
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity + 1)
                      }
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id, item.size)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="cart-item-price">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Tax (5%)</span>
            <span>Rs. {tax.toFixed(0)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</span>
          </div>
          {deliveryFee > 0 && (
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "16px",
              }}
            >
              Add Rs. {(1000 - subtotal).toLocaleString()} more for free
              delivery
            </p>
          )}

          <div className="summary-total">
            <span>Total</span>
            <span>Rs. {total.toFixed(0)}</span>
          </div>

          <div className="promo-input">
            <input type="text" placeholder="Promo code" />
            <button className="btn btn-outline btn-sm">Apply</button>
          </div>

          <Link to="/checkout" className="btn btn-primary">
            Proceed to Checkout <ArrowRight size={18} />
          </Link>

          <Link
            to="/menu"
            style={{
              display: "block",
              textAlign: "center",
              marginTop: "12px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;
