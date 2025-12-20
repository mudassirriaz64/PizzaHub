import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Percent,
  Receipt,
  Check,
  Package,
  X,
  User,
  UserPlus,
} from "lucide-react";
import api from "../services/api";
import CustomerModal from "../components/CustomerModal";
import ReceiptModal from "../components/ReceiptModal";

function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sizeModal, setSizeModal] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [lastOrder, setLastOrder] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/products/index.php");
      if (response.data.success) {
        setProducts(response.data.products.filter((p) => p.isAvailable));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories/index.php");
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 0 || product.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product) => {
    // If product has sizes, show size selection modal
    if (product.hasSizes && product.sizes && product.sizes.length > 0) {
      setSizeModal(product);
    } else {
      // Add directly to cart for products without sizes
      addToCart(product, null, product.price);
    }
  };

  const addToCart = (product, sizeName, price) => {
    // Create unique key for cart item (productId + sizeName)
    const cartKey = sizeName ? `${product.id}-${sizeName}` : `${product.id}`;
    const displayName = sizeName
      ? `${product.name} (${sizeName})`
      : product.name;

    const existing = cart.find((item) => item.cartKey === cartKey);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.cartKey === cartKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          cartKey,
          productId: product.id,
          name: displayName,
          sizeName: sizeName,
          price: price,
          quantity: 1,
        },
      ]);
    }
    setSizeModal(null);
  };

  const updateQuantity = (cartKey, delta) => {
    setCart(
      cart
        .map((item) => {
          if (item.cartKey === cartKey) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (cartKey) => {
    setCart(cart.filter((item) => item.cartKey !== cartKey));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  // Tax: 15% for cash, 5% for card
  const taxRate = paymentMethod === "cash" ? 0.15 : 0.05;
  // Discount is percentage-based (0-100)
  const discountAmount = subtotal * (discount / 100);
  const tax = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // If no customer selected, show customer modal first
    if (!selectedCustomer) {
      setShowCustomerModal(true);
      return;
    }

    // If customer already selected, process checkout directly
    processCheckout(selectedCustomer);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(false);
    // Automatically proceed with checkout after customer selection
    processCheckout(customer);
  };

  const processCheckout = async (customer) => {
    if (cart.length === 0) return;

    setProcessing(true);
    try {
      const response = await api.post("/orders/create.php", {
        items: cart.map((item) => ({
          productId: item.productId,
          sizeName: item.sizeName,
          quantity: item.quantity,
          price: item.price,
        })),
        orderType: "instore",
        deliveryType: "pickup",
        discount: discount,
        paymentMethod: paymentMethod,
        paymentStatus: "paid",
        // Add customer details
        userId: customer.type === "registered" ? customer.id : null,
        customerName: customer.name,
      });

      if (response.data.success) {
        setLastOrder({
          ...response.data.order,
          customerName: customer.name,
          customerType: customer.type,
          items: cart, // Keep cart items for receipt display
          paymentMethod: paymentMethod,
        });

        // Show success message first
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to process order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleReceiptClose = () => {
    setShowReceiptModal(false);
    setShowSuccessMessage(false);
    setLastOrder(null);
    setSelectedCustomer(null);
    clearCart();
  };

  const handleViewReceipt = () => {
    setShowSuccessMessage(false);
    setShowReceiptModal(true);
  };

  const handleNewOrder = () => {
    setShowSuccessMessage(false);
    setLastOrder(null);
    setSelectedCustomer(null);
    clearCart();
  };


  return (
    <div className="pos-page">
      <div className="pos-products">
        <div className="pos-header">
          <h1>Point of Sale</h1>
          <div className="pos-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="pos-categories">
          <button
            className={`category-chip ${
              selectedCategory === 0 ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(0)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-chip ${
                selectedCategory === cat.id ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pos-loading">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="pos-products-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="pos-product-card has-tooltip"
                onClick={() => handleProductClick(product)}
                data-tooltip={product.description || "No description"}
              >
                <div className="pos-product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <Package size={32} />
                  )}
                  {product.hasSizes && (
                    <span className="has-sizes-badge">Sizes</span>
                  )}
                </div>
                <div className="pos-product-info">
                  <h4>{product.name}</h4>
                  {product.hasSizes &&
                  product.sizes &&
                  product.sizes.length > 0 ? (
                    <span className="pos-product-price">
                      From Rs. {Math.min(...product.sizes.map((s) => s.price))}
                    </span>
                  ) : (
                    <span className="pos-product-price">
                      Rs. {product.price}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pos-cart">
        <div className="cart-header">
          <ShoppingCart size={20} />
          <h2>Current Order</h2>
          {cart.length > 0 && (
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear
            </button>
          )}
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingCart size={40} />
              <p>Cart is empty</p>
              <span>Add products to start an order</span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartKey} className="cart-item">
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <span>Rs. {item.price} each</span>
                </div>
                <div className="cart-item-controls">
                  <button onClick={() => updateQuantity(item.cartKey, -1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartKey, 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className="cart-item-subtotal">
                  Rs. {item.price * item.quantity}
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.cartKey)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <>
            <div className="cart-discount">
              <Percent size={18} />
              <input
                type="number"
                placeholder="Discount %"
                value={discount || ""}
                onChange={(e) =>
                  setDiscount(
                    Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                  )
                }
                min="0"
                max="100"
              />
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount ({discount}%)</span>
                  <span>-Rs. {Math.round(discountAmount)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Tax ({paymentMethod === "cash" ? "15%" : "5%"})</span>
                <span>Rs. {Math.round(tax)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>Rs. {Math.round(total)}</span>
              </div>
            </div>

            <div className="payment-methods">
              <button
                className={`payment-btn ${
                  paymentMethod === "cash" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                <Banknote size={20} />
                Cash
              </button>
              <button
                className={`payment-btn ${
                  paymentMethod === "card" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                <CreditCard size={20} />
                Card
              </button>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={processing}
            >
              {processing ? (
                <>Processing...</>
              ) : (
                <>
                  <Receipt size={20} />
                  Complete Order - Rs. {Math.round(total)}
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Size Selection Modal */}
      {sizeModal && (
        <div className="modal-overlay" onClick={() => setSizeModal(null)}>
          <div className="size-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Size</h2>
              <button className="close-btn" onClick={() => setSizeModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="size-modal-product">
              <h3>{sizeModal.name}</h3>
              <p>{sizeModal.categoryName}</p>
            </div>
            <div className="size-options">
              {sizeModal.sizes.map((size, idx) => (
                <button
                  key={idx}
                  className="size-option-btn"
                  onClick={() => addToCart(sizeModal, size.name, size.price)}
                >
                  <span className="size-option-name">{size.name}</span>
                  <span className="size-option-price">Rs. {size.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal */}
      {showSuccessMessage && lastOrder && (
        <div className="modal-overlay">
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">
              <Check size={48} />
            </div>
            <h2>Order Created Successfully!</h2>
            <div className="success-details">
              <div className="detail-row">
                <span className="label">Order Number:</span>
                <span className="value">{lastOrder.orderNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Invoice Number:</span>
                <span className="value">{lastOrder.invoiceNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Customer:</span>
                <span className="value">
                  {lastOrder.customerName}
                  <span className="customer-badge">
                    {lastOrder.customerType === 'registered' ? 'Registered' : 'Walk-in'}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Payment Method:</span>
                <span className="value">{lastOrder.paymentMethod === 'cash' ? 'Cash' : 'Card'}</span>
              </div>
              <div className="detail-row total">
                <span className="label">Total Amount:</span>
                <span className="value">Rs. {Math.round(lastOrder.total)}</span>
              </div>
            </div>
            <div className="success-actions">
              <button className="btn btn-secondary" onClick={handleNewOrder}>
                New Order
              </button>
              <button className="btn btn-primary" onClick={handleViewReceipt}>
                <Receipt size={18} />
                View & Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && lastOrder && (
        <ReceiptModal order={lastOrder} onClose={handleReceiptClose} />
      )}

      {/* Customer Selection Modal */}
      {showCustomerModal && (
        <CustomerModal onSelect={handleCustomerSelect} onClose={() => setShowCustomerModal(false)} />
      )}
    </div>
  );
}

export default POS;
