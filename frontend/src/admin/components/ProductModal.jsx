import { useState, useEffect, useMemo } from "react";
import { X, Package, FileText, Tag, Image } from "lucide-react";

// Size definitions for different categories
const PIZZA_SIZES = [
  { name: "Extra Large", key: "xl" },
  { name: "Large", key: "lg" },
  { name: "Medium", key: "md" },
  { name: "Small", key: "sm" },
  { name: "Personal (Mini)", key: "mini" },
];

const DRINK_SIZES = [
  { name: "1.5 Litre", key: "1.5l" },
  { name: "1 Litre", key: "1l" },
  { name: "Regular", key: "reg" },
];

function ProductModal({ product, categories, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    price: "",
    image: "",
    isAvailable: true,
  });
  const [sizes, setSizes] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [enableSizes, setEnableSizes] = useState(false); // For drinks toggle

  // Determine if selected category requires sizes
  const selectedCategory = useMemo(() => {
    if (!formData.categoryId) return null;
    return categories.find((c) => c.id === Number(formData.categoryId));
  }, [formData.categoryId, categories]);

  const categoryName = selectedCategory?.name?.toLowerCase() || "";
  const isPizza = categoryName === "pizza";
  const isDrinks = categoryName === "drinks";
  const sizeOptions = isPizza ? PIZZA_SIZES : isDrinks ? DRINK_SIZES : [];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        categoryId: product.categoryId || "",
        price: product.price || "",
        image: product.image || "",
        isAvailable:
          product.isAvailable !== undefined ? product.isAvailable : true,
      });

      // Initialize sizes from product
      if (product.sizes && product.sizes.length > 0) {
        const sizeMap = {};
        product.sizes.forEach((s) => {
          sizeMap[s.name] = s.price.toString();
        });
        setSizes(sizeMap);
        setEnableSizes(true); // If product has sizes, enable the toggle
      } else {
        setEnableSizes(false);
      }
    }
  }, [product]);

  // Reset sizes when category changes
  useEffect(() => {
    if (!product) {
      setSizes({});
      setEnableSizes(false);
    }
  }, [formData.categoryId, product]);

  // Determine if sizes should be shown (Pizza always, Drinks only if enabled)
  const showSizes = isPizza || (isDrinks && enableSizes);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (showSizes) {
      // Check at least one size has a price
      const hasAtLeastOneSize = sizeOptions.some(
        (s) => sizes[s.name] && Number(sizes[s.name]) > 0
      );
      if (!hasAtLeastOneSize) {
        newErrors.sizes = "At least one size with price is required";
      }
    } else {
      if (
        !formData.price ||
        isNaN(formData.price) ||
        Number(formData.price) <= 0
      ) {
        newErrors.price = "Valid price is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        categoryId: Number(formData.categoryId),
        image: formData.image.trim(),
        isAvailable: formData.isAvailable,
      };

      if (showSizes) {
        submitData.price = 0;
        submitData.sizes = sizeOptions
          .filter((s) => sizes[s.name] && Number(sizes[s.name]) > 0)
          .map((s) => ({
            name: s.name,
            price: Number(sizes[s.name]),
          }));
      } else {
        submitData.price = Number(formData.price);
        submitData.sizes = [];
      }

      await onSubmit(submitData);
    } catch (error) {
      setErrors({ submit: "Failed to save product. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSizeChange = (sizeName, value) => {
    if (value === "" || /^\d*$/.test(value)) {
      setSizes((prev) => ({ ...prev, [sizeName]: value }));
      if (errors.sizes) {
        setErrors((prev) => ({ ...prev, sizes: null }));
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? "Edit Product" : "Add New Product"}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errors.submit && <div className="error-banner">{errors.submit}</div>}

          <div className="form-group">
            <label htmlFor="name">
              <Package size={16} />
              Product Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter product name"
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">
              <FileText size={16} />
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">
              <Tag size={16} />
              Category
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => handleChange("categoryId", e.target.value)}
              className={errors.categoryId ? "error" : ""}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="error-text">{errors.categoryId}</span>
            )}
          </div>

          {/* Drinks size toggle checkbox */}
          {isDrinks && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={enableSizes}
                  onChange={(e) => setEnableSizes(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                This drink has multiple sizes
              </label>
            </div>
          )}

          {/* Show sizes for Pizza or Drinks with sizes enabled */}
          {showSizes && (
            <div className="form-group sizes-group">
              <label>
                Size Pricing
                <span className="label-hint">Enter price for each size</span>
              </label>
              <div className="sizes-grid">
                {sizeOptions.map((size) => (
                  <div key={size.key} className="size-input">
                    <span className="size-name">{size.name}</span>
                    <div className="input-group">
                      <input
                        type="text"
                        value={sizes[size.name] || ""}
                        onChange={(e) =>
                          handleSizeChange(size.name, e.target.value)
                        }
                        placeholder="0"
                      />
                      <span className="input-suffix">PKR</span>
                    </div>
                  </div>
                ))}
              </div>
              {errors.sizes && (
                <span className="error-text">{errors.sizes}</span>
              )}
            </div>
          )}

          {/* Show single price for categories without sizes */}
          {!showSizes && formData.categoryId && (
            <div className="form-group">
              <label htmlFor="price">Price</label>
              <div className="input-group">
                <input
                  type="text"
                  id="price"
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*$/.test(value)) {
                      handleChange("price", value);
                    }
                  }}
                  placeholder="Enter price"
                  className={errors.price ? "error" : ""}
                />
                <span className="input-suffix">PKR</span>
              </div>
              {errors.price && (
                <span className="error-text">{errors.price}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="image">
              <Image size={16} />
              Image URL
            </label>
            <input
              type="text"
              id="image"
              value={formData.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) => handleChange("isAvailable", e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Product is available for sale
            </label>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : product
                ? "Update Product"
                : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductModal;
