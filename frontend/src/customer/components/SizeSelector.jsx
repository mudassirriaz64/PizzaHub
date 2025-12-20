import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";

function SizeSelector({ product, onSelect, onClose, isOpen = true }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Reset state whenever modal reopens with a different product
  useEffect(() => {
    setSelectedSize(null);
    setQuantity(1);
  }, [product, isOpen]);

  if (!product || !isOpen) return null;

  const sizes = product.sizes || {};
  const sizeEntries = Object.entries(sizes);

  // If no sizes, use base price
  if (sizeEntries.length === 0) {
    onSelect(product, quantity, null);
    return null;
  }

  const handleConfirm = () => {
    if (selectedSize) {
      onSelect(product, quantity, selectedSize);
    }
  };

  return (
    <div className="size-selector-overlay" onClick={onClose}>
      <div className="size-selector-modal" onClick={(e) => e.stopPropagation()}>
        <button className="size-selector-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="size-selector-header">
          <div className="size-selector-product">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="size-selector-placeholder">🍕</div>
            )}
            <div>
              <h3>{product.name}</h3>
              <span className="size-selector-category">
                {product.categoryName}
              </span>
            </div>
          </div>
        </div>

        <div className="size-selector-body">
          <h4>Select Size</h4>
          <div className="size-options">
            {sizeEntries.map(([sizeName, price]) => (
              <button
                key={sizeName}
                className={`size-option ${
                  selectedSize === sizeName ? "selected" : ""
                }`}
                onClick={() => setSelectedSize(sizeName)}
              >
                <span className="size-name">{sizeName}</span>
                <span className="size-price">Rs. {price.toLocaleString()}</span>
                {selectedSize === sizeName && (
                  <Check size={18} className="size-check" />
                )}
              </button>
            ))}
          </div>

          <div className="quantity-section">
            <h4>Quantity</h4>
            <div className="quantity-controls">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>
        </div>

        <div className="size-selector-footer">
          <div className="size-selector-total">
            <span>Total:</span>
            <strong>
              Rs.{" "}
              {selectedSize
                ? (sizes[selectedSize] * quantity).toLocaleString()
                : "---"}
            </strong>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!selectedSize}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default SizeSelector;
